# eazyway

Frontend prototype for project Eazyway.

## Usage

### Fetch Mapillary images

```
mkdir data
python3 scripts/get_mapillary_data.py access_token organization_id [image_id_blacklist [sequence_id_blacklist]]
```

### Fetch obstacles data

```
python3 scripts/get_obstacles.py URL
```

### Generate images and audio files

```
mkdir img/obstacles
mkdir -p audio/obstacles
python3 scripts/get_obstacles_details.py URL data/obstacles.json
```

### Convert audio files to mp3

```
cd audio/obstacles
for f in *.wav; do ffmpeg -i $f -vn -ar 44100 -ac 2 -b:a 128k ${f%.wav}.mp3; done
```

### Dev server

#### Set custom vector tile style

Add file src/config/style.js` and implement the `set` function in `src/config/style.js`:

```
var set = function(map) {
  // TODO get your own style object

  map.setStyle(style);
};

module.exports = {
  set: set
};
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
