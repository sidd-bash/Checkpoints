const features = [
  {
    title: "Quick Setup",
    description: "Start your product quickly with predefined frontend and backend template."
  },
  {
    title: "Authentication Ready",
    description: "Built-in login and signup with JWT token authentication."
  },
  {
    title: "Scalable Dashboard",
    description: "Modular and extendable dashboard to manage your data and users."
  },
  {
    title: "MongoDB Integration",
    description: "Seamlessly connect to a MongoDB backend with environment-configured connection."
  }
];

export default function FeaturesSection() {
  return (
    <section id="learn-more" className="py-20 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h2 className="text-4xl font-extrabold mb-4">Features</h2>
        <p className="text-lg text-gray-700">Everything you need to build a micro SaaS product.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
        {features.map(({ title, description }) => (
          <div key={title} className="bg-white rounded shadow p-6">
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
