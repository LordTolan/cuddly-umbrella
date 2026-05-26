import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Receipt, FileText, Droplets, Sun, Car } from 'lucide-react';

export default function Billing() {
  const [files, setFiles] = useState([]);

  const onDrop = useCallback((accepted) => {
    setFiles((prev) => [...prev, ...accepted]);
    // TODO: call uploadBill API
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'text/csv': ['.csv'] },
  });

  const touTips = [
    { icon: Droplets, text: 'Shift spa/pool heating to off-peak hours' },
    { icon: Sun, text: 'Run heavy appliances during solar production hours' },
    { icon: Car, text: 'Delay EV charging to off-peak or solar hours' },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-bold">Billing Validation</h1>

      {/* Upload */}
      <div {...getRootProps()} className={`card border-2 border-dashed cursor-pointer transition-colors text-center py-10 ${isDragActive ? 'border-energy-500 bg-energy-500/5' : 'border-gray-700 hover:border-gray-500'}`}>
        <input {...getInputProps()} />
        <Upload className="w-10 h-10 text-gray-500 mx-auto mb-3" />
        <p className="text-lg font-medium">Upload Duke Energy Bill</p>
        <p className="text-sm text-gray-500 mt-1">Drag & drop PDF or CSV, or click to browse</p>
      </div>

      {/* How It Works */}
      <div>
        <h2 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">How Validation Works</h2>
        <div className="card space-y-4">
          {['Upload your Duke Energy bill (PDF/CSV)', 'We extract billed kWh and cost', 'Compare against measured consumption & solar', 'Identify any discrepancies'].map((text, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-md bg-energy-500/10 flex items-center justify-center text-energy-400 text-sm font-bold">{i + 1}</div>
              <p className="text-sm">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bill History */}
      <div>
        <h2 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Bill History</h2>
        {files.length === 0 ? (
          <div className="card flex flex-col items-center justify-center h-32">
            <Receipt className="w-8 h-8 text-gray-600 mb-2" />
            <p className="text-gray-500">No bills uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((f, i) => (
              <div key={i} className="card flex items-center gap-3">
                <FileText className="w-5 h-5 text-energy-400" />
                <div><p className="text-sm font-medium">{f.name}</p><p className="text-xs text-gray-500">{(f.size / 1024).toFixed(0)} KB</p></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TOU Tips */}
      <div>
        <h2 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">TOU Optimization</h2>
        <div className="card space-y-3">
          {touTips.map(({ icon: Icon, text }, i) => (
            <div key={i} className="flex items-center gap-3">
              <Icon className="w-5 h-5 text-solar-400 shrink-0" />
              <p className="text-sm">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
