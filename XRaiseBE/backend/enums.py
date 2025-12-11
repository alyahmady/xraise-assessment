from enum import IntEnum, StrEnum


class Currency(StrEnum):
    US_DOLLAR = "USD"


class PlanPrice(IntEnum):
    BASIC = 1000  # $10.00
    PRO = 2000  # $20.00
