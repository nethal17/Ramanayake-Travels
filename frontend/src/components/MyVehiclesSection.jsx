import { useEffect, useState } from "react";

export default function MyVehiclesSection() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVehicles() {
      setLoading(true);
      try {
        const res = await fetch("/api/profile/my-vehicles", { credentials: "include" });
        const data = await res.json();
        setVehicles(Array.isArray(data) ? data : []);
      } catch {
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    }
    fetchVehicles();
  }, []);

  if (loading) return <div className="p-4">Loading your vehicles...</div>;
  if (!vehicles.length) return <div className="p-4">No vehicles registered yet.</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">My Registered Vehicles</h2>
      <div className="space-y-4">
        {vehicles.map(v => (
          <div key={v._id} className="border rounded p-3 flex items-center gap-4 bg-gray-50">
            {v.imageUrl && <img src={v.imageUrl} alt="Vehicle" className="w-20 h-16 object-cover rounded" />}
            <div className="flex-1">
              <div className="font-semibold">{v.make} {v.model} ({v.year})</div>
              <div className="text-sm text-gray-600">LKR {v.price} per day</div>
              <div className="text-sm text-gray-500">{v.description}</div>
            </div>
            <div className="ml-4">
              <span className={`px-3 py-1 rounded text-xs font-bold ${v.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : v.status === 'approved' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                {v.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
