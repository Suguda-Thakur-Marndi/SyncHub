# Files Management Design System Specs

> **Inherits from:** `../MASTER.md`  
> **Page/Tab:** Project Files (`/workspace/:workspaceId/project/:projectId?tab=files`)

## 1. Information Architecture
- **Header Toolbar:** Search file input, File type filter (All, Images, Documents, Spreadsheets, Archives), Sort order (Date, Name, Size), and "Upload Files" drag-and-drop dropzone.
- **Upload Dropzone:**
  - Dashed border container with UploadCloud icon, "Drag & drop files here or browse", size limit note (up to 25MB).
- **Files Grid & List Toggle:**
  - **Grid View:** Card preview showing thumbnail/icon, file name, size, upload date, uploader avatar, and action menu.
  - **List View:** Table format with columns: Name, Type, Size, Uploaded By, Date, Actions (Download, Preview, Delete).
- **File Type Icons (Lucide SVGs, never emojis):**
  - PDF: Red `FileText` icon.
  - Image: Blue `ImageIcon`.
  - Document/Docx: Indigo `FileCode` / `FileText`.
  - Spreadsheet: Emerald `FileSpreadsheet`.
  - Archive/Zip: Amber `FileArchive`.
  - Default: Slate `File`.

## 2. Empty State
- Centered file folder icon: "No project files uploaded yet. Drag and drop project documents, designs, or specifications to share with your team."
