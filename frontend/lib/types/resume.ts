export interface ResumeSection {
  id: string;
  title: string;
  content: string; // Tiptap HTML content
}

export interface ResumeBasics {
  name: string;
  label?: string;
  email?: string;
  phone?: string;
  website?: string;
  location?: string;
}

export interface ResumeData {
  basics: ResumeBasics;
  sections: ResumeSection[];
}

export type ResumeTemplateId = "classic" | "modern" | "compact";

export interface ResumeTheme {
  primaryColor: string;
  headingColor: string;
  textColor: string;
  fontFamily: string;
}
