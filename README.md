# Seed Embalses Data

A Node.js application designed to manage and maintain reservoir data. This tool automates the process of seeding initial reservoir data and keeping weekly statistics up to date through an interactive console interface.

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
