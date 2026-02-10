# Art Provenance Frontend

This is a modern, responsive React application built with Vite and Tailwind CSS. It provides a researcher-friendly interface for browsing and analyzing art provenance data.

## Tech Stack
- **Framework**: React 18 (with TypeScript)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **API Client**: Axios

## Directory Structure
- `src/components/`: Reusable UI components (e.g., `Layout.tsx`).
- `src/pages/`: Main page-level components (Artworks, Details, Login).
- `src/services/`: API integration layer (`api.ts`).
- `src/context/`: Global state management (Authentication).
- `src/utils/`: Helper functions (e.g., color generators).

## Adding a New Page

To add a new view (e.g., a "Researcher Profile" page):

1. **Create the Component**: Add a new file in `src/pages/ResearcherProfile.tsx`:
   ```tsx
   import React from 'react';
   
   const ResearcherProfile: React.FC = () => {
       return <div className="p-8"><h1>Profile</h1></div>;
   };
   export default ResearcherProfile;
   ```

2. **Register the Route**: Open `src/App.tsx` and add your new route inside the `ProtectedRoute`:
   ```tsx
   <Route path="profile" element={<ResearcherProfile />} />
   ```

3. **Add to Sidebar**: Open `src/components/Layout.tsx` and add a link to the `navLinks` array:
   ```typescript
   const navLinks = [
       ...
       { to: '/profile', icon: User, label: 'Profile', active: location.pathname === '/profile' },
   ];
   ```

## API Integration

All backend communication should go through `src/services/api.ts`.

1. **Add the Method**:
   ```typescript
   export const getProfile = async () => {
       const response = await api.get('/auth/profile/');
       return response.data;
   };
   ```

2. **Use in Component**:
   ```typescript
   useEffect(() => {
       getProfile().then(data => setProfile(data));
   }, []);
   ```

## Responsiveness
The app uses a **Mobile-First** approach. Use Tailwind's responsive prefixes (e.g., `md:grid-cols-2`) to ensure content looks great on both mobile and desktop.
