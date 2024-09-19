"use client"
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

export default function Main() {
  return (
    <div>
      <Navbar />
      <Sidebar />
      <div className="ml-[280px] mt-[100px] p-4">
        children
      </div>
    </div>
  );
}