from rest_framework import serializers

from apps.users.models import PremiumPlan, User


class UpgradeSerializer(serializers.Serializer):
    plan = serializers.ChoiceField(choices=[PremiumPlan.BASIC, PremiumPlan.PRO])

    def validate(self, data):
        user: User = self.context["request"].user
        current = user.current_plan
        target = data["plan"]

        if current == target:
            raise serializers.ValidationError("Already on this plan.")

        allowed_paths = {
            PremiumPlan.NONE: [PremiumPlan.BASIC],
            PremiumPlan.BASIC: [PremiumPlan.PRO],
            PremiumPlan.PRO: [],
        }
        if target not in allowed_paths.get(current, []):
            raise serializers.ValidationError("Upgrade path not allowed.")

        return data


class DowngradeSerializer(serializers.Serializer):
    plan = serializers.ChoiceField(choices=[PremiumPlan.NONE, PremiumPlan.BASIC])

    def validate(self, data):
        user: User = self.context["request"].user
        current = user.current_plan
        target = data["plan"]

        if current == target:
            raise serializers.ValidationError("Already on this plan.")

        allowed_paths = {
            PremiumPlan.PRO: [PremiumPlan.BASIC, PremiumPlan.NONE],
            PremiumPlan.BASIC: [PremiumPlan.NONE],
            PremiumPlan.NONE: [],
        }
        if target not in allowed_paths.get(current, []):
            raise serializers.ValidationError("Downgrade path not allowed.")
        return data


class BillingStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("subscription_status", "current_plan", "total_amount_paid")
