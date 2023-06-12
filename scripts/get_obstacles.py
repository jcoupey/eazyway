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


if __name__ == "__main__":
    obstacles_URL = sys.argv[1]

    obstacles = [o for o in get_obstacles(obstacles_URL) if bbox_ok(o)]

    internal_obstacle_list = [
        {"id": o["IDRELEVE"], "location": [o["LONGITUDE"], o["LATITUDE"]]}
        for o in obstacles
    ]

    with open("data/obstacles.json", "w") as out:
        json.dump(internal_obstacle_list, out)
