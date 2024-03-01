import '../styles/CodeEditor.css';
import React, { useRef, useEffect } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-monokai';
import ace from 'ace-builds/src-noconflict/ace';
import { useAppState } from './AppStateContext';
import '../styles/CodeEditor.css';

function CodeEditor( { focused }) {

  console.log("Rendering CodeEditor, focused:", focused); // Debugging statement

  const { code, setCode } = useAppState();
  const aceEditorRef = useRef();
  const markers = useRef({});

  useEffect(() => {
    const editor = aceEditorRef.current?.editor;
    //let markers = []; // Array to hold marker IDs

    if (editor) {


      editor.setReadOnly(!focused);
      if (focused) {
        console.log("focusing")
        editor.focus();
      }

      // Disable Ace Editor's default commands (shortcuts)
      editor.commands.bindKeys({});
      editor.commands.bindKey("Ctrl-j", null);
      editor.commands.bindKey("Ctrl-k", null);
      editor.commands.bindKey("Ctrl-l", null);


      // Ctrl + , = Drop marker 1
      editor.commands.addCommand({
        name: 'dropMarker1',
        bindKey: { win: 'Ctrl-,', mac: 'Ctrl-,' },
        exec: (editor) => {
          markers.current['marker1'] = editor.getCursorPosition();
          console.log("m1 dropped at : " + editor.getCursorPosition())
        }
      });

      // Option + , = Jump to marker 1
      editor.commands.addCommand({
        name: 'jumpToMarker1',
        bindKey: { win: 'Alt-,', mac: 'Option-,' },
        exec: (editor) => {
          const position = markers.current['marker1'];
          if (position) {
            editor.moveCursorToPosition(position);
            console.log("going to m1 at : " + position)
          }
        }
      });

      // Ctrl + , = Drop marker 2
      editor.commands.addCommand({
        name: 'dropMarker2',
        bindKey: { win: 'Ctrl-.', mac: 'Ctrl-.' },
        exec: (editor) => {
          markers.current['marker2'] = editor.getCursorPosition();
          console.log("m2 dropped at : " + editor.getCursorPosition())
        }
      });

      // Option + , = Jump to marker 2
      editor.commands.addCommand({
        name: 'jumpToMarker2',
        bindKey: { win: 'Alt-.', mac: 'Option-.' },
        exec: (editor) => {
          const position = markers.current['marker2'];
          if (position) {
            editor.moveCursorToPosition(position);
            console.log("going to m2 at : " + position)
          }
        }
      });

      // Command + 1: Move to start
      editor.commands.addCommand({
        name: 'moveToStart',
        bindKey: { win: 'Ctrl-1', mac: 'Option-1' },
        exec: (editor) => {
          editor.gotoLine(1, 0, false);
        }
      });

      // Command + 2: Move to middle
      editor.commands.addCommand({
        name: 'moveToMiddle',
        bindKey: { win: 'Ctrl-2', mac: 'Option-2' },
        exec: (editor) => {
          const middleLine = Math.floor(editor.session.getLength() / 2);
          editor.gotoLine(middleLine, 0, false);
        }
      });

      // Command + 3: Move to end
      editor.commands.addCommand({
        name: 'moveToEnd',
        bindKey: { win: 'Ctrl-3', mac: 'Option-3' },
        exec: (editor) => {
          const lastLine = editor.session.getLength();
          editor.gotoLine(lastLine, 0, false);
        }
      });

    }
  }, []);

  function handleCodeChange(newCode) {
    setCode(newCode); // Updates the state with the new code
  }

  function moveToLine(lineNumber) {
    if (aceEditorRef.current) {
      aceEditorRef.current.editor.gotoLine(lineNumber, 0, true);
    }
  }




  return (
    <div style={{ flex: 2 }}>
      <AceEditor
        ref={aceEditorRef}
        mode="javascript"
        theme="monokai"
        name="UNIQUE_ID_OF_DIV"
        value={code} // Ensure the editor displays the current state
        onChange={handleCodeChange} // Set up the onChange handler
        editorProps={{ $blockScrolling: true }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

export default CodeEditor;