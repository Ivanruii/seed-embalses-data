# Seed Embalses Data

A Node.js application designed to manage and maintain reservoir data. This tool automates the process of seeding initial reservoir data and keeping weekly statistics up to date through an interactive console interface.

## Steps to Run the Application

1. Clone the repo.

2. Install dependencies:

```bash
npm install
```

3. Ensure you have Docker installed and running on your machine.

4. Start the local MongoDB database using Docker Compose:

```bash
npm run start:local-db
```

5. If you are using default mongodb local server values, setup the following environment variables in a `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=embalses
API_URL=https://services-eu1.arcgis.com/RvnYk1PBUJ9rrAuT/arcgis/rest/services/Embalses_Total/FeatureServer/0/query
```

6. Start the application:

```bash
npm run start:console
```

7. Now we are going to fetch the latest data from the ArcGIS REST API service and export it as a JSON file.

> Choose option 1. to retrieve the latest data and seed it into the JSON file.

8. Once you have got the JSON file, you can choose option 2. to update the weekly statistics based on the latest data:

- If there is no data in the database, it will seed the data from the JSON file.
- If there is data, it will update the weekly statistics based on the existing data in the database.

## Available Scripts

- `npm run start:console`: Launches the interactive console application where you can choose between seeding data or updating weekly statistics.
- `npm run start:import-data`: Directly runs the initial data seeding process.
- `npm run start:local-db`: Starts the local database using Docker Compose.
- `npm run build`: Compiles the TypeScript code to JavaScript.

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
MONGODB_URI=
MONGODB_DB_NAME=

API_URL=
```

## Data Source

This application uses the ArcGIS REST API service to fetch reservoir data. The API endpoint provides access to the "Embalses Total" (Total Reservoirs) feature service, which contains detailed information about water reservoirs including:

- Current water levels
- Reservoir capacities
- Geographic locations
- Historical data

The API is publicly accessible and does not require authentication. Data is updated periodically by the source provider.
