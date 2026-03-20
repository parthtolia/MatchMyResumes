"use client"
import React, { useEffect, useState, useRef } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"

interface SectionEditorProps {
  content: string
  onChange: (newContent: string) => void
  placeholder?: string
}

const SectionEditor: React.FC<SectionEditorProps> = ({ content, onChange, placeholder }) => {
  const [isMounted, setIsMounted] = useState(false)
  const contentRef = useRef(content)

  const editorConfig = {
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder || "Start typing...",
      }),
    ],
    content: contentRef.current,
    immediatelyRender: false,
    onUpdate: ({ editor }: { editor: any }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm prose-invert max-w-none focus:outline-none min-h-[50px] text-gray-100",
      },
    },
  }

  const editor = useEditor(isMounted ? editorConfig : { content: "", immediatelyRender: false })

  // Ensure editor only initializes on client after hydration
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Update content if it changes from outside (e.g. AI optimization)
  useEffect(() => {
    if (editor && isMounted && content !== editor.getHTML()) {
      editor.commands.setContent(content)
      contentRef.current = content
    }
  }, [content, editor, isMounted])

  if (!isMounted || !editor) {
    return <div className="prose prose-sm prose-invert max-w-none min-h-[50px] text-gray-100 p-3" />
  }

  return <EditorContent editor={editor} />
}

export default SectionEditor
