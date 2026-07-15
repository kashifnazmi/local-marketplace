import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="flex flex-col items-center justify-center py-32 text-center">
    <h1 className="text-6xl font-bold text-primary-600">404</h1>
    <p className="text-gray-500 mt-2 mb-6">Oops! The page you're looking for doesn't exist.</p>
    <Link to="/" className="bg-primary-600 text-white px-5 py-2.5 rounded-lg font-medium">
      Go Home
    </Link>
  </div>
);

export default NotFound;
