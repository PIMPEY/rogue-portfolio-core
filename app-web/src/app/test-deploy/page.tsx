export default function TestDeploy() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-2xl text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🚀 DEPLOYMENT TEST SUCCESS! 🚀
        </h1>
        <p className="text-xl text-gray-600 mb-4">
          If you can see this page, Railway IS deploying new code!
        </p>
        <p className="text-sm text-gray-500">
          Deployed: {new Date().toLocaleString()}
        </p>
        <div className="mt-6 p-4 bg-green-100 rounded-lg">
          <p className="text-green-800 font-medium">
            ✅ The Simple MVP improvements are also deployed!
          </p>
        </div>
      </div>
    </div>
  );
}
