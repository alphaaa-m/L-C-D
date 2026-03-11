# My College Journey

My College Journey is a modern React + Vite web app for presenting the last two years of college as a visual story.

- A ready-to-use starter memory collection is included with local placeholder images.
- Your personal memory collection is loaded automatically when you add entries.

## Run the app

```bash
npm install
npm run dev
```

To create a production build:

```bash
npm run build
```

## Project structure

```text
public/
	images/
src/
	components/
	data/
		sampleMemories.json
		memories.json
	App.jsx
	main.jsx
```

## Where to put your images

Store personal photos inside:

```text
public/images/
```

Example:

```text
public/images/trip1.jpg
public/images/hackathon.jpg
public/images/friends.jpg
```

Reference them inside JSON with the public path form:

```json
"image": "/images/trip1.jpg"
```

## How the data files work

### Starter collection

`src/data/sampleMemories.json` contains 10 ready-to-use placeholder memories. The app uses this automatically when the custom file has no memories yet.

### Content version

`src/data/memories.json` is the file for your real content.

Because standard JSON does not support comments, the file includes helper fields such as `_comment`, `howToEdit`, and `exampleEntry`. The app ignores those fields and only reads the `memories` array.

When `memories` contains one or more entries, the app automatically switches to content mode.

## How to edit memories.json

Open `src/data/memories.json` and add objects to the `memories` array.

Each memory should include:

```json
{
	"id": 1,
	"title": "Trip to the Mountains",
	"date": "Aug 2024",
	"sortDate": "2024-08-18",
	"image": "/images/trip1.jpg",
	"description": "Weekend trip with college friends after final exams.",
	"fullDescription": "Optional longer story shown in the fullscreen modal.",
	"occasionType": "Trip",
	"tags": ["Trips", "Friends"]
}
```

Field notes:

- `id`: Unique number for each memory.
- `title`: Card and modal title.
- `date`: Human-readable label such as `March 2024` or `Aug 2024`.
- `sortDate`: Optional ISO date used for more precise ordering.
- `image`: Path to an image in `public/images`.
- `description`: Short card description.
- `fullDescription`: Optional expanded text for the modal.
- `occasionType`: Short category badge shown on the card.
- `tags`: Used in the modal and for category filters.

## How to add a new memory

1. Add the image file to `public/images`.
2. Create a new object in the `memories` array inside `src/data/memories.json`.
3. Give it a unique `id` and set the `image` path to the new file.
4. Save the file and refresh the app if needed.

## Filters and year slider

The app includes:

- Timeline and Gallery view toggle
- Tag filters for All, Projects, Trips, Friends, and Competitions
- A year slider that narrows memories by year
- A fullscreen animated modal shared across both views
- Dark and light mode toggle

## Fallback behavior

The app loads `src/data/memories.json` when it has real memories. If the file is missing or its `memories` array is empty, it automatically falls back to `src/data/sampleMemories.json`.
