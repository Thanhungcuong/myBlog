import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import './index.css';
import reportWebVitals from './reportWebVitals';

import Layout from './layouts/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SettingsUser from './pages/SettingsUser';
const router = createBrowserRouter([
  {
    path: 'login',
    element: <Login />,
  },
  {
    path: 'register',
    element: <Register />,
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/settings',
        element: <SettingsUser />,
      },


    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <SnackbarProvider maxSnack={3}>
      <RouterProvider router={router} />
    </SnackbarProvider>
  </React.StrictMode>
);

reportWebVitals();
