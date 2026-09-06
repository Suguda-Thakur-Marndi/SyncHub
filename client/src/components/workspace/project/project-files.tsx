import { useState } from "react";
import {
  UploadCloud,
  FileText,
  FileCode,
  FileSpreadsheet,
  FileArchive,
  Image as ImageIcon,
  Download,
  Trash2,
  Search,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ProjectFile {
  id: string;
  name: string;
  size: string;
  type: "pdf" | "image" | "code" | "sheet" | "archive" | "doc";
  uploadedBy: string;
  uploadedAt: string;
}

export default function ProjectFiles() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");

  const [files, setFiles] = useState<ProjectFile[]>([
    {
      id: "f-1",
      name: "Product-Requirements-Document-v2.pdf",
      size: "2.4 MB",
      type: "pdf",
      uploadedBy: "Alex Morgan",
      uploadedAt: "Sep 4, 2026",
    },
    {
      id: "f-2",
      name: "Dashboard-Wireframes-Figma.png",
      size: "4.8 MB",
      type: "image",
      uploadedBy: "Sarah Jenkins",
      uploadedAt: "Sep 5, 2026",
    },
    {
      id: "f-3",
      name: "database-schema-export.sql",
      size: "142 KB",
      type: "code",
      uploadedBy: "Alex Morgan",
      uploadedAt: "Sep 6, 2026",
    },
    {
      id: "f-4",
      name: "Sprint-Capacity-Planning.xlsx",
      size: "860 KB",
      type: "sheet",
      uploadedBy: "You",
      uploadedAt: "Today",
    },
    {
      id: "f-5",
      name: "Brand-Asset-Bundle.zip",
      size: "18.2 MB",
      type: "archive",
      uploadedBy: "Design Team",
      uploadedAt: "Yesterday",
    },
  ]);

  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFileList = e.target.files;
    if (uploadedFileList && uploadedFileList.length > 0) {
      const file = uploadedFileList[0];
      const newFile: ProjectFile = {
        id: `f-${Date.now()}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: file.name.endsWith(".pdf")
          ? "pdf"
          : file.name.match(/\.(png|jpg|jpeg|webp)$/i)
          ? "image"
          : file.name.match(/\.(xlsx|csv)$/i)
          ? "sheet"
          : file.name.match(/\.(zip|tar|gz)$/i)
          ? "archive"
          : "doc",
        uploadedBy: "You",
        uploadedAt: "Just now",
      };
      setFiles((prev) => [newFile, ...prev]);
      toast({
        title: "File Uploaded",
        description: `"${file.name}" has been uploaded to project files.`,
      });
    }
  };

  const handleDeleteFile = (id: string, name: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    toast({
      title: "File Removed",
      description: `"${name}" was deleted.`,
    });
  };

  const getFileIcon = (type: ProjectFile["type"]) => {
    switch (type) {
      case "pdf":
        return <FileText className="w-5 h-5 text-rose-500" />;
      case "image":
        return <ImageIcon className="w-5 h-5 text-blue-500" />;
      case "code":
        return <FileCode className="w-5 h-5 text-indigo-500" />;
      case "sheet":
        return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
      case "archive":
        return <FileArchive className="w-5 h-5 text-amber-500" />;
      default:
        return <FileText className="w-5 h-5 text-slate-500" />;
    }
  };

  const filteredFiles = files.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "ALL" || f.type === selectedType.toLowerCase();
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Upload Zone */}
      <div className="clean-card bg-white dark:bg-slate-800 p-6 border-dashed border-2 border-slate-300 dark:border-slate-700/80 flex flex-col items-center justify-center text-center group hover:border-indigo-500 transition-colors">
        <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mb-3 group-hover:scale-110 transition-transform">
          <UploadCloud className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Upload project documents, assets, or specifications
        </h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          Drag and drop files here or click to browse. Supports PDF, images, spreadsheets, and archives up to 25MB.
        </p>

        <label className="mt-4">
          <input
            type="file"
            onChange={handleSimulateUpload}
            className="hidden"
          />
          <span className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 shadow-sm cursor-pointer transition-all">
            <Plus className="w-3.5 h-3.5" />
            Browse Files
          </span>
        </label>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-4 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {["ALL", "PDF", "IMAGE", "SHEET", "ARCHIVE"].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedType === type
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Files List Table */}
      <div className="clean-card bg-white dark:bg-slate-800 overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-700/80 text-slate-400 uppercase tracking-wider font-semibold">
              <th className="py-3 px-4">File Name</th>
              <th className="py-3 px-4">Size</th>
              <th className="py-3 px-4">Uploaded By</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredFiles.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  No files found matching your search.
                </td>
              </tr>
            ) : (
              filteredFiles.map((file) => (
                <tr
                  key={file.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <td className="py-3 px-4 flex items-center gap-2.5">
                    <span className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      {getFileIcon(file.type)}
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-xs">
                      {file.name}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono">{file.size}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="bg-indigo-600 text-white text-[9px] font-bold">
                          {file.uploadedBy.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {file.uploadedBy}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{file.uploadedAt}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          toast({
                            title: "Downloading File",
                            description: `Downloading ${file.name}...`,
                          });
                        }}
                        className="h-7 w-7 text-slate-500 hover:text-indigo-600 cursor-pointer"
                        title="Download file"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteFile(file.id, file.name)}
                        className="h-7 w-7 text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="Delete file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
