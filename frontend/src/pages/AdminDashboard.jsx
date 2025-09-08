import { useEffect, useState } from 'react';
import { RiCarLine, RiUser3Line, RiCheckboxCircleLine, RiCloseCircleLine } from 'react-icons/ri';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalVehicles: 0,
    pendingVehicles: 0,
    approvedVehicles: 0,
    rejectedVehicles: 0,
    totalUsers: 0
  });

  useEffect(() => {
    // In a real application, this would fetch data from your API
    // For now, we'll use placeholder data
    setStats({
      totalVehicles: 24,
      pendingVehicles: 5,
      approvedVehicles: 18,
      rejectedVehicles: 1,
      totalUsers: 42
    });
  }, []);

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className={`bg-white rounded-lg shadow-md p-5 border-t-4 ${color}`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h2 className="text-2xl font-bold mt-2">{value}</h2>
        </div>
        <div className={`p-3 rounded-full ${color.replace('border-', 'bg-').replace('-500', '-100')}`}>
          <Icon className={color.replace('border-', 'text-')} size={24} />
        </div>
      </div>
    </div>
  );

  const recentVehicles = [
    { id: 1, make: 'Toyota', model: 'Corolla', year: 2020, owner: 'John Doe', status: 'pending', date: '2025-09-05' },
    { id: 2, make: 'Honda', model: 'Civic', year: 2019, owner: 'Jane Smith', status: 'approved', date: '2025-09-04' },
    { id: 3, make: 'Nissan', model: 'Sentra', year: 2021, owner: 'Mike Johnson', status: 'pending', date: '2025-09-03' },
    { id: 4, make: 'Mazda', model: 'CX-5', year: 2022, owner: 'Sarah Wilson', status: 'approved', date: '2025-09-02' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Vehicles" value={stats.totalVehicles} icon={RiCarLine} color="border-blue-500" />
        <StatCard title="Pending Approvals" value={stats.pendingVehicles} icon={RiCarLine} color="border-yellow-500" />
        <StatCard title="Approved Vehicles" value={stats.approvedVehicles} icon={RiCheckboxCircleLine} color="border-green-500" />
        <StatCard title="Total Users" value={stats.totalUsers} icon={RiUser3Line} color="border-purple-500" />
      </div>
      
      {/* Recent Vehicle Applications */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Vehicle Applications</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentVehicles.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{vehicle.make} {vehicle.model}</div>
                    <div className="text-sm text-gray-500">{vehicle.year}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.owner}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${vehicle.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        vehicle.status === 'approved' ? 'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {vehicle.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                    {vehicle.status === 'pending' && (
                      <>
                        <button className="text-green-600 hover:text-green-900 mr-3">Approve</button>
                        <button className="text-red-600 hover:text-red-900">Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
