import MyVehiclesSection from "../components/MyVehiclesSection";

export default function ProfilePage() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <MyVehiclesSection />
      {/* Add more profile info or settings here later */}
    </div>
  );
}
