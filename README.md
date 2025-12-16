# Dentanum Analytics

A React-based analytics dashboard for dental treatment data visualization, built with Vite and Bun.

## Features

- Interactive charts and visualizations using Recharts
- Multiple chart types (Line, Area, Bar)
- Treatment filtering and year-based filtering
- Real-time data processing
- Responsive design with Tailwind CSS
- TypeScript support

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Bun** - Package manager and runtime
- **TypeScript** - Type safety
- **Recharts** - Chart library
- **Tailwind CSS** - Styling (via CDN)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed on your system

### Installation

1. Install dependencies:

```bash
bun install
```

### Development

Start the development server:

```bash
bun run dev
```

The application will be available at `http://localhost:3000`

### Building for Production

Build the application:

```bash
bun run build
```

Preview the production build:

```bash
bun run preview
```

## Project Structure

```
dentanum-analytics/
├── src/
│   ├── App.tsx          # Main analytics dashboard component
│   ├── main.tsx          # Application entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
└── README.md           # This file
```

## Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run preview` - Preview production build
- `bun run lint` - Run ESLint

## Data Structure

The dashboard processes dental treatment data with the following structure:

```typescript
interface TreatmentData {
  _id: {
    yearMonth: string; // Format: "YYYY-MM"
    treatmentCode: string; // Treatment code (e.g., "RES", "ODG")
    treatmentDescription: string; // Full treatment description
  };
  count: number; // Number of treatments
}
```

## Chart Types

1. **Line Chart** - Best for showing trends over time
2. **Area Chart** - Best for showing proportions and cumulative data
3. **Bar Chart** - Best for comparing specific values

## Treatment Codes

The dashboard supports various dental treatment codes:

- RES: Restauración Dental
- ODG: Odontología General
- OTD: Ortodoncia
- PRO: Prótesis Dental
- EXO: Exodoncia
- END: Endodoncia
- And many more...

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the Dentanum ecosystem.






