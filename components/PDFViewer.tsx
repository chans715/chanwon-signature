'use client';

import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

// PDF.js 워커 설정
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  pdfUrl: string;
}

const PDFViewer = ({ pdfUrl }: PDFViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  function changePage(offset: number) {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return newPageNumber >= 1 && newPageNumber <= (numPages || 1) ? newPageNumber : prevPageNumber;
    });
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  function zoomIn() {
    setScale(prevScale => Math.min(prevScale + 0.1, 2.0));
  }

  function zoomOut() {
    setScale(prevScale => Math.max(prevScale - 0.1, 0.5));
  }

  return (
    <div className="pdf-viewer w-full h-full flex flex-col">
      <div className="pdf-controls bg-gray-100 p-2 flex justify-between items-center border-b border-gray-300">
        <div className="flex items-center space-x-2">
          <button 
            onClick={previousPage} 
            disabled={pageNumber <= 1}
            className="px-2 py-1 bg-white border border-gray-300 rounded-md disabled:opacity-50"
          >
            이전
          </button>
          <span>
            페이지 {pageNumber} / {numPages || '--'}
          </span>
          <button 
            onClick={nextPage} 
            disabled={pageNumber >= (numPages || 1)}
            className="px-2 py-1 bg-white border border-gray-300 rounded-md disabled:opacity-50"
          >
            다음
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={zoomOut}
            className="px-2 py-1 bg-white border border-gray-300 rounded-md"
          >
            -
          </button>
          <span>{Math.round(scale * 100)}%</span>
          <button 
            onClick={zoomIn}
            className="px-2 py-1 bg-white border border-gray-300 rounded-md"
          >
            +
          </button>
        </div>
      </div>
      <div className="pdf-document flex-1 overflow-auto bg-gray-200 flex justify-center">
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          }
          error={
            <div className="flex flex-col justify-center items-center h-full text-red-500">
              <p>PDF를 불러오는데 실패했습니다.</p>
              <p className="text-sm">다시 시도해주세요.</p>
            </div>
          }
        >
          <Page 
            pageNumber={pageNumber} 
            scale={scale}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
      </div>
    </div>
  );
};

export default PDFViewer; 