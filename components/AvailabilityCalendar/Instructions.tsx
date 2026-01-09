const Instructions = () => {
  return (
    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="text-sm font-semibold text-blue-900 mb-2">How to use:</h3>
      <ul className="text-sm text-blue-800 space-y-1">
        <li>
          • <strong>Dotted blocks</strong> show employee&apos;s claimed
          availability
        </li>
        <li>
          • <strong>Click and drag vertically</strong> on any time slot to
          create confirmed shifts
        </li>
        <li>
          • <strong>Green hover:</strong> Scheduling within claimed availability
          hours
        </li>
        <li>
          • <strong>Yellow hover:</strong> Scheduling outside claimed
          availability (override)
        </li>
        <li>
          • <strong>Solid blocks</strong> indicate confirmed shifts
        </li>
        <li>
          • <strong>Hover over solid blocks and click X</strong> to remove
          confirmed shifts
        </li>
        <li>
          • <strong>Colors represent roles:</strong> Orange (Kitchen), Blue
          (Service), Purple (Security)
        </li>
        <li>
          • <strong>Scroll horizontally</strong> when viewing multiple employees
        </li>
      </ul>
      <div className="mt-3 p-2 bg-blue-100 rounded border border-blue-300">
        <p className="text-xs text-blue-900">
          💡 <strong>Tip:</strong> You can now schedule employees at any time,
          even outside their claimed availability. This allows flexibility for
          emergency shifts or special circumstances.
        </p>
      </div>
    </div>
  );
};

export default Instructions;
