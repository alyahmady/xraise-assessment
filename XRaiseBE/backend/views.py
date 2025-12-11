from django.db import connection
from drf_spectacular.utils import OpenApiExample, OpenApiResponse, extend_schema
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


class HealthCheckView(GenericAPIView):
    permission_classes = [AllowAny]

    @extend_schema(
        tags=["system"],
        responses={
            200: OpenApiResponse(
                description="System is healthy",
                response=dict,
                examples=[
                    OpenApiExample(
                        "Success Response",
                        value={
                            "healthcheck": "Running",
                            "is_postgres_working": True,
                        },
                    ),
                ],
            ),
            400: OpenApiResponse(
                description="System is unhealthy",
                response=dict,
                examples=[
                    OpenApiExample(
                        "Error Response",
                        value={
                            "healthcheck": "Running",
                            "is_postgres_working": False,
                        },
                    ),
                ],
            ),
        },
    )
    def get(self, request):
        status_code = 200
        is_postgres_working = True

        try:
            cursor = connection.cursor()
            cursor.execute("SELECT 1")
        except Exception:
            is_postgres_working = False
            status_code = 400

        return Response(
            data={
                "healthcheck": "Running",
                "is_postgres_working": is_postgres_working,
            },
            status=status_code,
        )
