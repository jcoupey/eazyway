import json, requests, sys

EAST = 2.37949
WEST = 2.31293
SOUTH = 48.80223
NORTH = 48.82973


def get_obstacles(url):
    return requests.get(url).json()


def bbox_ok(o):
    return (
        SOUTH <= o["LATITUDE"]
        and o["LATITUDE"] <= NORTH
        and WEST <= o["LONGITUDE"]
        and o["LONGITUDE"] <= EAST
    )


def level_ok(o):
    return o["GENE"] == 3 or o["GENE"] == 4


def get_level(o):
    return "problem" if (o["GENE"] == 3) else "danger"


def get_type(o):
    if o["TYPE"][1]:
        current_type = "wheelchair"
    else:
        assert o["TYPE"][2]
        current_type = "sight"

    return current_type


if __name__ == "__main__":
    obstacles_URL = sys.argv[1]

    obstacles = [o for o in get_obstacles(obstacles_URL) if bbox_ok(o) and level_ok(o)]

    geojson_obstacles = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [o["LONGITUDE"], o["LATITUDE"]],
                },
                "properties": {
                    "id": o["IDRELEVE"],
                    "level": get_level(o),
                    "type": get_type(o),
                },
            }
            for o in obstacles
        ],
    }

    with open("data/obstacles.json", "w") as out:
        json.dump(geojson_obstacles, out)
