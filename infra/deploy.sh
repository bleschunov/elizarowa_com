#!/usr/bin/env bash
#
# Создаёт/обновляет инфраструктуру сайта (CloudFormation-стек в us-east-1).
#
#   infra/deploy.sh dns    — только DNS-зона Route 53 (сайт пока смотрит на старый сервер)
#   infra/deploy.sh site   — сертификат, S3, CloudFront; домен переключается на CloudFront
#   infra/deploy.sh status — вывести outputs стека
#
# Переменные окружения:
#   DEPLOY_ROLE_NAME — имя IAM-роли GitHub Actions (OIDC); ей выдаются права на деплой.
#                      Если не задано, используется значение из прошлого запуска.
#   AWS_PROFILE      — профиль aws CLI, как обычно.
#
# Повторный запуск безопасен: CloudFormation применяет только разницу.

set -euo pipefail

STACK="elizarowa-com"
REGION="us-east-1"
TEMPLATE="$(cd "$(dirname "$0")" && pwd)/site.yaml"

usage() { sed -n '3,15p' "$0" | sed 's/^# \{0,1\}//'; exit 1; }

outputs() {
  aws cloudformation describe-stacks --region "$REGION" --stack-name "$STACK" \
    --query 'Stacks[0].Outputs[].[OutputKey,OutputValue]' --output table
}

case "${1:-}" in
  dns)    enable_site=false ;;
  site)   enable_site=true ;;
  status) outputs; exit 0 ;;
  *)      usage ;;
esac

params=("EnableSite=$enable_site")
if [[ -n "${DEPLOY_ROLE_NAME:-}" ]]; then
  params+=("DeployRoleName=$DEPLOY_ROLE_NAME")
fi

echo "→ CloudFormation: стек $STACK ($REGION), EnableSite=$enable_site"
[[ "$enable_site" == true ]] && echo "  Сертификат и CloudFront создаются 5–20 минут, это нормально."

aws cloudformation deploy \
  --region "$REGION" \
  --stack-name "$STACK" \
  --template-file "$TEMPLATE" \
  --capabilities CAPABILITY_NAMED_IAM \
  --no-fail-on-empty-changeset \
  --parameter-overrides "${params[@]}"

# Защита от случайного удаления стека (вместе с DNS-зоной и почтовыми записями).
aws cloudformation update-termination-protection --region "$REGION" --stack-name "$STACK" \
  --enable-termination-protection >/dev/null

outputs
