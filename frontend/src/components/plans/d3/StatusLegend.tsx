import React from "react";

interface StatusLegendProps {
  isFullScreen?: boolean;
}

/**
 * Status Legend component showing different milestone statuses and their colors
 */
const StatusLegend: React.FC<StatusLegendProps> = ({ isFullScreen = false }) => {
  const statuses = [
    { name: "Not Started", color: "#94a3b8" },
    { name: "In Progress", color: "#3b82f6" },
    { name: "Completed", color: "#22c55e" },
    { name: "At Risk", color: "#f59e0b" },
    { name: "Delayed", color: "#ef4444" },
  ];

  return (
    <div
      className={`absolute bottom-4 left-4 bg-white p-3 rounded-md shadow-md text-xs text-gray-600 ${
        isFullScreen ? "opacity-90 hover:opacity-100 transition-opacity" : ""
      }`}
    >
      <div className="mt-3 pt-2 border-t border-gray-200">
        <p className="font-medium mb-1">📊 Status Legend</p>
        <div className="grid grid-cols-2 gap-x-2">
          {statuses.map((status) => (
            <div key={status.name} className="flex items-center">
              <span
                className="inline-block w-3 h-3 mr-1 rounded-full"
                style={{ backgroundColor: status.color }}
              ></span>
              {status.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatusLegend;
