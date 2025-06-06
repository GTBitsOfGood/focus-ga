"use  client";

import { MDXEditor, MDXEditorMethods, listsPlugin, toolbarPlugin, UndoRedo, BoldItalicUnderlineToggles, ListsToggle, linkPlugin, linkDialogPlugin, CreateLink } from "@mdxeditor/editor";
import { FC } from "react";
import '@mdxeditor/editor/style.css'

interface EditorProps {
  markdown: string;
  editorRef?: React.MutableRefObject<MDXEditorMethods | null>;
  handleEditorChange: (text: string) => void;
  disableURL: boolean;
}

/**
 * Extend this Component further with the necessary plugins or props you need.
 * proxying the ref is necessary. Next.js dynamically imported components don't support refs.
 */
const Editor: FC<EditorProps> = ({ markdown, editorRef, handleEditorChange, disableURL }) => {
  
  return (
    <div className="h-full flex flex-col overflow-auto border border-gray-300 pb-2 rounded-md">
      <MDXEditor
        contentEditableClassName="prose prose-slate max-w-none h-full min-h-32"
        onChange={(e) => handleEditorChange(e)}
        ref={editorRef}
        markdown={markdown}
        plugins={[
          toolbarPlugin({
            toolbarContents: () => (
              <>
                <UndoRedo />
                <BoldItalicUnderlineToggles />
                {!disableURL && <CreateLink />}
                <ListsToggle options={["bullet", "number"]}/>
              </>
            ),
          }),
          listsPlugin(),
          linkPlugin(),
          linkDialogPlugin()
        ]}
      />
    </div>
    
  );
};
export default Editor;

