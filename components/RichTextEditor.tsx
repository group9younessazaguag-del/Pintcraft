import React, { useRef } from 'react';
import BoldIcon from './icons/BoldIcon';
import ItalicIcon from './icons/ItalicIcon';
import Heading2Icon from './icons/Heading2Icon';
import ListOrderedIcon from './icons/ListOrderedIcon';
import ListUnorderedIcon from './icons/ListUnorderedIcon';

interface RichTextEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const EditorButton: React.FC<{ onClick: () => void; children: React.ReactNode, title: string }> = ({ onClick, children, title }) => (
  <button
    type="button"
    title={title}
    onMouseDown={(e) => e.preventDefault()} // Prevent editor from losing focus
    onClick={onClick}
    className="p-2 rounded-md text-slate-600 hover:bg-slate-200 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
  >
    {children}
  </button>
);

const RichTextEditor: React.FC<RichTextEditorProps> = ({ label, value, onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    onChange(e.currentTarget.innerHTML);
  };

  const execCmd = (command: string, valueArg?: string) => {
    document.execCommand(command, false, valueArg);
    if (editorRef.current) {
        editorRef.current.focus();
        onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1.5">{label}</label>
      <div className="border border-slate-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-pink-500">
        <div className="flex items-center gap-1 p-2 border-b border-slate-200 bg-slate-50 rounded-t-lg">
          <EditorButton onClick={() => execCmd('bold')} title="Bold"><BoldIcon className="w-5 h-5" /></EditorButton>
          <EditorButton onClick={() => execCmd('italic')} title="Italic"><ItalicIcon className="w-5 h-5" /></EditorButton>
          <EditorButton onClick={() => execCmd('formatBlock', '<h2>')} title="Heading 2"><Heading2Icon className="w-5 h-5" /></EditorButton>
          <EditorButton onClick={() => execCmd('insertUnorderedList')} title="Unordered List"><ListUnorderedIcon className="w-5 h-5" /></EditorButton>
          <EditorButton onClick={() => execCmd('insertOrderedList')} title="Ordered List"><ListOrderedIcon className="w-5 h-5" /></EditorButton>
        </div>
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          dangerouslySetInnerHTML={{ __html: value }}
          className="w-full min-h-[200px] p-3 prose prose-sm max-w-none focus:outline-none"
        />
      </div>
    </div>
  );
};

export default RichTextEditor;
