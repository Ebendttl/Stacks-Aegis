#!/bin/bash
mv dashboard dashboard-backup
npm create vite@latest dashboard -- --template react
cd dashboard
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install lucide-react class-variance-authority clsx tailwind-merge
