export default function HeroSection() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 px-6 text-center">
      <h1 className="text-5xl font-extrabold mb-4 leading-tight">
        Build Your Micro SaaS Fast and Easy
      </h1>
      <p className="max-w-2xl mx-auto mb-8 text-lg">
        A ready-to-use, scalable React + Tailwind template with authentication, dashboard, and landing pages to kickstart your startup product.
      </p>
      <div className="flex justify-center space-x-4">
        <a href="#signup" className="bg-white text-indigo-700 font-semibold px-8 py-3 rounded shadow hover:bg-gray-100">
          Get Started
        </a>
        <a href="#learn-more" className="border border-white px-8 py-3 rounded hover:bg-white hover:text-indigo-700">
          Learn More
        </a>
      </div>
    </section>
  );
}
