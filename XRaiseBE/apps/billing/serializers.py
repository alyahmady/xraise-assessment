from rest_framework import serializers

from apps.users.models import PremiumPlan, User


class UpgradeSerializer(serializers.Serializer):
    plan = serializers.ChoiceField(choices=[PremiumPlan.BASIC, PremiumPlan.PRO])

    def validate(self, data):
        user: User = self.context["request"].user
        current: str = user.current_plan
        target = data["plan"]

        if current == target:
            raise serializers.ValidationError("Already on this plan.")

        # Define upgrade plan hierarchy: NONE > BASIC > PRO
        allowed_paths: dict[str, list[str]] = {
            PremiumPlan.NONE: [PremiumPlan.BASIC],
            PremiumPlan.BASIC: [PremiumPlan.PRO],
            PremiumPlan.PRO: [],
        }
        if target not in allowed_paths.get(current, []):
            raise serializers.ValidationError("Target plan must be higher than current plan.")

        return data


class DowngradeSerializer(serializers.Serializer):
    plan = serializers.ChoiceField(choices=[PremiumPlan.NONE, PremiumPlan.BASIC])

    def validate(self, data):
        user: User = self.context["request"].user
        current: str = user.current_plan
        target = data["plan"]

        if current == target:
            raise serializers.ValidationError("Already on this plan.")

        # Define downgrade plan hierarchy: NONE < BASIC < PRO
        allowed_paths: dict[str, list[str]] = {
            PremiumPlan.PRO: [PremiumPlan.BASIC, PremiumPlan.NONE],
            PremiumPlan.BASIC: [PremiumPlan.NONE],
            PremiumPlan.NONE: [],
        }
        if target not in allowed_paths.get(current, []):
            raise serializers.ValidationError("Target plan must be lower than current plan.")

        return data


class BillingStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("subscription_status", "current_plan", "total_amount_paid")
