export const Settings = {
    "rounds": 10,
    "passScore": 80,
    "failScore": 50,
    "defaultLevel": 0,
    "preventNegativeResults": true,
    "levels": [
        {
            "numRange": [1, 5],
            "operations": ["+"],
            "interval": 5,
            "n": 1
        },
        {
            "numRange": [1, 5],
            "operations": ["+"],
            "interval": 5,
            "n": 2
        },
        {
            "numRange": [1, 5],
            "operations": ["+", "-",],
            "interval": 5,
            "n": 2
        },
        {
            "numRange": [1, 10],
            "operations": ["+", "-"],
            "interval": 5,
            "n": 1
        },
        {
            "numRange": [1, 10],
            "operations": ["+", "-"],
            "interval": 5,
            "n": 2
        },
        {
            "numRange": [1, 33],
            "operations": ["+"],
            "interval": 5,
            "n": 1
        },
        {
            "numRange": [1, 33],
            "operations": ["+"],
            "interval": 5,
            "n": 2
        },
        {
            "numRange": [1, 33],
            "operations": ["+", "-"],
            "interval": 5,
            "n": 2
        }
    ]
}
