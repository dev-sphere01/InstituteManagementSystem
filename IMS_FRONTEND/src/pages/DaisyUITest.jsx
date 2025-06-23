import React from 'react';

const DaisyUITest = () => {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-4xl font-bold text-center mb-8">DaisyUI Test Page</h1>
      
      {/* Buttons */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <button className="btn">Default</button>
            <button className="btn btn-primary">Primary</button>
            <button className="btn btn-secondary">Secondary</button>
            <button className="btn btn-accent">Accent</button>
            <button className="btn btn-ghost">Ghost</button>
            <button className="btn btn-link">Link</button>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card bg-base-100 shadow-xl">
          <figure>
            <img src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp" alt="Shoes" />
          </figure>
          <div className="card-body">
            <h2 className="card-title">Shoes!</h2>
            <p>If a dog chews shoes whose shoes does he choose?</p>
            <div className="card-actions justify-end">
              <button className="btn btn-primary">Buy Now</button>
            </div>
          </div>
        </div>

        <div className="card bg-primary text-primary-content">
          <div className="card-body">
            <h2 className="card-title">Card title!</h2>
            <p>If a dog chews shoes whose shoes does he choose?</p>
            <div className="card-actions justify-end">
              <button className="btn">Buy Now</button>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">
              Card title!
              <div className="badge badge-secondary">NEW</div>
            </h2>
            <p>If a dog chews shoes whose shoes does he choose?</p>
            <div className="card-actions justify-end">
              <div className="badge badge-outline">Fashion</div>
              <div className="badge badge-outline">Products</div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Elements */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Form Elements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">What is your name?</span>
              </label>
              <input type="text" placeholder="Type here" className="input input-bordered" />
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Pick the best fantasy franchise</span>
              </label>
              <select className="select select-bordered">
                <option disabled selected>Pick one</option>
                <option>Star Wars</option>
                <option>Harry Potter</option>
                <option>Lord of the Rings</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Your bio</span>
              </label>
              <textarea className="textarea textarea-bordered" placeholder="Bio"></textarea>
            </div>

            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Remember me</span>
                <input type="checkbox" className="checkbox" />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="space-y-4">
        <div className="alert alert-info">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>New software update available.</span>
        </div>
        
        <div className="alert alert-success">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Your purchase has been confirmed!</span>
        </div>
      </div>

      {/* Theme Toggle */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Theme Toggle</h2>
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Toggle theme</span>
              <input type="checkbox" className="toggle" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DaisyUITest;
