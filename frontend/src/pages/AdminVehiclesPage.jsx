import { useState, useEffect } from 'react';
import { RiCheckboxCircleLine, RiCloseCircleLine } from 'react-icons/ri';

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'

  useEffect(() => {
    // In a real application, this would fetch from your API
    // For demo, using static data
    const demoData = [
      { _id: '1', make: 'Toyota', model: 'Corolla', year: 2020, price: 5000, owner: { name: 'John Doe', email: 'john@example.com' }, status: 'pending', createdAt: '2025-09-05T12:30:45Z', imageUrl: '' },
      { _id: '2', make: 'Honda', model: 'Civic', year: 2019, price: 4500, owner: { name: 'Jane Smith', email: 'jane@example.com' }, status: 'approved', createdAt: '2025-09-04T10:20:15Z', imageUrl: '' },
      { _id: '3', make: 'Nissan', model: 'Sentra', year: 2021, price: 6000, owner: { name: 'Mike Johnson', email: 'mike@example.com' }, status: 'pending', createdAt: '2025-09-03T15:10:30Z', imageUrl: '' },
      { _id: '4', make: 'Mazda', model: 'CX-5', year: 2022, price: 7500, owner: { name: 'Sarah Wilson', email: 'sarah@example.com' }, status: 'approved', createdAt: '2025-09-02T09:45:20Z', imageUrl: '' },
      { _id: '5', make: 'Kia', model: 'Forte', year: 2018, price: 3800, owner: { name: 'Robert Brown', email: 'robert@example.com' }, status: 'rejected', createdAt: '2025-09-01T14:25:10Z', imageUrl: '' },
      { _id: '6', make: 'Hyundai', model: 'Elantra', year: 2020, price: 4200, owner: { name: 'Emily Davis', email: 'emily@example.com' }, status: 'pending', createdAt: '2025-08-31T11:15:40Z', imageUrl: '' },
    ];
    
    setTimeout(() => {
      setVehicles(demoData);
      setLoading(false);
    }, 500); // Simulate network delay
  }, []);

  const handleApprove = (id) => {
    setVehicles(vehicles.map(v => 
      v._id === id ? {...v, status: 'approved'} : v
    ));
  };

  const handleReject = (id) => {
    setVehicles(vehicles.map(v => 
      v._id === id ? {...v, status: 'rejected'} : v
    ));
  };

  const filteredVehicles = filter === 'all' 
    ? vehicles 
    : vehicles.filter(v => v.status === filter);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Vehicle Applications</h1>
        <div className="flex space-x-2">
          <button 
            onClick={() => setFilter('all')} 
            className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-gray-700 text-white' : 'bg-gray-200'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('pending')} 
            className={`px-3 py-1 rounded ${filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-yellow-100'}`}
          >
            Pending
          </button>
          <button 
            onClick={() => setFilter('approved')} 
            className={`px-3 py-1 rounded ${filter === 'approved' ? 'bg-green-500 text-white' : 'bg-green-100'}`}
          >
            Approved
          </button>
          <button 
            onClick={() => setFilter('rejected')} 
            className={`px-3 py-1 rounded ${filter === 'rejected' ? 'bg-red-500 text-white' : 'bg-red-100'}`}
          >
            Rejected
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="loader">Loading...</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/Day</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No vehicles found matching the selected filter.
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((vehicle) => (
                  <tr key={vehicle._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center">
                          {vehicle.imageUrl ? (
                            <img className="h-10 w-10 rounded-md object-cover" src={vehicle.imageUrl} alt="" />
                          ) : (
                            <span className="text-gray-500 text-xs">No img</span>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{vehicle.make} {vehicle.model}</div>
                          <div className="text-sm text-gray-500">{vehicle.year}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{vehicle.owner.name}</div>
                      <div className="text-sm text-gray-500">{vehicle.owner.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">LKR {vehicle.price}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${vehicle.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          vehicle.status === 'approved' ? 'bg-green-100 text-green-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {vehicle.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(vehicle.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                      {vehicle.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleApprove(vehicle._id)} 
                            className="text-green-600 hover:text-green-900 mr-3 flex items-center"
                          >
                            <RiCheckboxCircleLine className="mr-1" /> Approve
                          </button>
                          <button 
                            onClick={() => handleReject(vehicle._id)} 
                            className="text-red-600 hover:text-red-900 flex items-center"
                          >
                            <RiCloseCircleLine className="mr-1" /> Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
