import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Booking from "@/components/Booking";
import Footer from "@/components/Footer";

function BookingFallback() {
  return (
    <div className="min-h-[50vh] border-t border-white/10 bg-navy pt-24 pb-32 text-center text-white/45">
      Carregando formulário…
    </div>
  );
}

export default function ReservarPage() {
  return (
    <>
      <Navbar />
      <main className="w-full max-w-full overflow-x-clip pt-20">
        <Suspense fallback={<BookingFallback />}>
          <Booking />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
