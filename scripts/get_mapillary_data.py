import json, mercantile, requests, sys
from vt2geojson.tools import vt_bytes_to_geojson

EAST = 2.37949
WEST = 2.31293
SOUTH = 48.80223
NORTH = 48.82973


def feature_ok(f, org_id, image_id_blacklist, sequence_id_blacklist):
    return (
        f["geometry"]["type"] == "Point"
        and "organization_id" in f["properties"]
        and f["properties"]["organization_id"] == org_id
        and f["properties"]["id"] not in image_id_blacklist
        and f["properties"]["sequence_id"] not in sequence_id_blacklist
    )


def get_filtered_data(access_token, org_id, image_id_blacklist, sequence_id_blacklist):
    bounds = (WEST, SOUTH, EAST, NORTH)
    tiles = list(mercantile.tiles(*bounds, zooms=14))

    filtered_geojson = {"type": "FeatureCollection", "features": []}
    for tile in tiles:
        tile_url = "https://tiles.mapillary.com/maps/vtp/mly1_public/2/{}/{}/{}?access_token={}".format(
            tile.z, tile.x, tile.y, access_token
        )
        response = requests.get(tile_url)
        data = vt_bytes_to_geojson(response.content, tile.x, tile.y, tile.z)

        filtered_geojson["features"].extend(
            [
                f
                for f in data["features"]
                if feature_ok(f, org_id, image_id_blacklist, sequence_id_blacklist)
            ]
        )

    return filtered_geojson


if __name__ == "__main__":
    access_token = sys.argv[1]
    org_id = int(sys.argv[2])

    image_id_blacklist = []
    if len(sys.argv) > 3:
        id_csv = sys.argv[3]
        with open(id_csv, "r") as f:
            lines = f.readlines()
            image_id_blacklist = [int(l) for l in lines]

    sequence_id_blacklist = []
    if len(sys.argv) > 4:
        id_csv = sys.argv[4]
        with open(id_csv, "r") as f:
            lines = f.readlines()
            sequence_id_blacklist = [l.rstrip() for l in lines]

    filtered_data = get_filtered_data(
        access_token, org_id, image_id_blacklist, sequence_id_blacklist
    )

    with open("data/mapillary.json", "w") as out:
        json.dump(filtered_data, out)
