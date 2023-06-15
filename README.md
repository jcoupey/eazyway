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

#### Set custom vector tile style

```
cp your_style.json data/style.json
```

#### Set Mapillary access token

```
echo acces_token > data/mly_token.json
```

#### Run locally

```
npm run start
```

### Standalone app folder

```
npm run dist
```
