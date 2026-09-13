import React, { useState } from "react";
export const TenantPortal: React.FC = () => {
  const [visits, setVisits] = useState(3);
  return (
    <div className="p-6 bg-slate-900 text-white rounded-xl">
      <h2 className="text-xl font-bold">Divyavastu Spaces Tenant Portal</h2>
      <p>Visit Counter: #{visits} (Tours 1-5 Free / Zero Brokerage)</p>
    </div>
  );
};