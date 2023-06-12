# eazyway

Frontend prototype for project Eazyway.

## Usage

### Fetch Mapillary images

```
mkdir data
python3 scripts/get_mapillary_data.py access_token organization_id
```

### Fetch obstacles data

```
python3 scripts/get_obstacles.py URL
```

### Dev server

Update Mapillary access token in `src/utils/viewer.js` and key for
vector tile source in `src/config/map.js`.

```
npm run start
```

### Standalone app folder

```
npm run dist
```
