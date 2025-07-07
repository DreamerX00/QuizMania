import React from 'react';

const Matrix = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="font-heading text-lg mb-2">[Matrix]</div>
      <table className="w-full bg-white/10 rounded-xl overflow-hidden">
        <thead>
          <tr>
            <th></th>
            <th>A</th>
            <th>B</th>
            <th>C</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>HTML</td>
            <td><input type="radio" name="html" /></td>
            <td><input type="radio" name="html" /></td>
            <td><input type="radio" name="html" /></td>
          </tr>
          <tr>
            <td>Python</td>
            <td><input type="radio" name="python" /></td>
            <td><input type="radio" name="python" /></td>
            <td><input type="radio" name="python" /></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Matrix; 