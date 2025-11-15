# AI Development Rules for League Of Loolish E3 Pick'ems

This document outlines the core technologies and best practices for developing features within this application.

## Tech Stack Overview

*   **Frontend Framework**: React.js for building dynamic user interfaces.
*   **Language**: TypeScript for type safety and improved code quality.
*   **Styling**: Tailwind CSS for a utility-first approach to styling, ensuring responsive and consistent designs.
*   **UI Library**: Shadcn/ui (built on Radix UI) for accessible and customizable pre-built components.
*   **Routing**: React Router DOM for declarative client-side navigation.
*   **Backend & Database**: Supabase for authentication, real-time database, and backend services.
*   **Icons**: Lucide React for a comprehensive set of customizable SVG icons.
*   **Build Tool**: Vite for a fast development experience and optimized production builds.

## Library Usage Rules

To maintain consistency and efficiency, please adhere to the following guidelines when implementing new features or modifying existing ones:

*   **UI Components**:
    *   **Prioritize Shadcn/ui**: Always try to leverage existing components from the Shadcn/ui library first.
    *   **Custom Components**: If a required component is not available in Shadcn/ui or needs significant custom logic/styling, create a new component file in `src/components/`.
    *   **No Direct Shadcn/ui Modification**: Do not directly edit files within the `shadcn/ui` directory. If a component needs changes, create a new component that wraps or extends its functionality.
*   **Styling**:
    *   **Tailwind CSS Only**: All styling must be implemented using Tailwind CSS utility classes. Avoid inline styles or separate CSS files/modules unless explicitly necessary for very specific, isolated cases (and only after discussion).
    *   **Responsive Design**: Always ensure designs are responsive and adapt well to different screen sizes using Tailwind's responsive utilities.
*   **Routing**:
    *   **React Router DOM**: Use `react-router-dom` for all application navigation.
    *   **Route Definitions**: Keep the main application routes organized within `src/App.tsx`.
*   **State Management**:
    *   **Local State**: For component-specific state, use React's `useState` and `useReducer` hooks.
    *   **Global State**: For application-wide or shared state, utilize React's Context API (e.g., `AuthContext`).
*   **Backend Interactions**:
    *   **Supabase Client**: All interactions with the database, authentication, and other backend services must use the `supabase` client from `src/lib/supabase.ts`.
    *   **API Layer**: Create dedicated API utility files (e.g., `src/api/matchAPI.js`) for structured and reusable data operations.
*   **Icons**:
    *   **Lucide React**: Use icons exclusively from the `lucide-react` library.
*   **File Structure**:
    *   **New Components/Hooks**: Always create new, small, and focused files for new components (`src/components/`) or hooks (`src/hooks/`). Avoid adding multiple components to a single file.
    *   **Pages**: Place main view components in `src/pages/`.
*   **Error Handling**:
    *   **No Try/Catch (unless specified)**: Do not wrap API calls or other operations in `try/catch` blocks unless specifically requested. Errors should bubble up to allow for centralized handling and debugging.
*   **Simplicity**:
    *   **Avoid Over-engineering**: Focus on implementing the user's request with the simplest and most elegant solution possible. Avoid adding complex error handling, fallback mechanisms, or features not explicitly requested.