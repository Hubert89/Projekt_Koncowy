import { Outlet } from "react-router-dom";

/** Layout centrowany dla widoków typu „panel” */
export default function PanelCenter() {
  return (
    <main className="panel-main">
      <Outlet />
    </main>
  );
}
