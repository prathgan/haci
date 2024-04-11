import '../styles/CodeEditor.css';
import React, { useRef, useEffect, useState } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-monokai';
import ace from 'ace-builds/src-noconflict/ace';
import { useAppState } from './AppStateContext';
import '../styles/CodeEditor.css';

function CodeEditor({ focused, onExecuteCode }) {

  console.log("Rendering CodeEditor, focused:", focused); // Debugging statement

  const { code, setCode } = useAppState();
  const aceEditorRef = useRef();
  const markers = useRef({});
  const [granularity, setGranularity] = useState('token'); // New state for granularity
  const [isReadingCharacters, setIsReadingCharacters] = useState(false);
  const [previousLineIndentation, setPreviousLineIndentation] = useState(0);


  const controlMotor = async (finger, action) => {
    try {
      await fetch('http://localhost:3001/control-motor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motor: finger, action }),
      });
    } catch (error) {
      console.error('Error sending motor command:', error);
    }
  };


  useEffect(() => {
    const editor = aceEditorRef.current?.editor;
    //let markers = []; // Array to hold marker IDs

    if (editor) {
      editor.setReadOnly(!focused);
    }

    if (editor && focused) {

      console.log("Setting up Ace Editor")

      editor.focus();

      // Disable Ace Editor's default commands (shortcuts)
      editor.commands.bindKeys({});
      editor.commands.bindKey("Ctrl-j", null);
      editor.commands.bindKey("Ctrl-k", null);
      editor.commands.bindKey("Ctrl-l", null);
      editor.commands.bindKey("Ctrl-g", null);
      editor.commands.bindKey("Ctrl-b", null);
      editor.commands.bindKey("Ctrl-v", null);

      // Mapping of code symbols to their spoken equivalents
      const symbolMap = {
        ';': 'semicolon',
        ',': 'comma',
        '{': 'open brace',
        '}': 'close brace',
        '(': 'open parenthesis',
        ')': 'close parenthesis',
        '[': 'open bracket',
        ']': 'close bracket',
        '=': 'equals',
        '==': 'double equals',
        '===': 'triple equals',
        '+': 'plus',
        '-': 'minus',
        '*': 'asterisk',
        '/': 'forward slash',
        '<': 'less than',
        '>': 'greater than',
        '!': 'exclamation mark',
        '!=': 'not equals',
        '&&': 'and',
        //'||': 'or',
        //'/*': 'start block comment',
        '*/': 'end block comment',
        '//': 'double slash comment',
        '%': 'percent',
        '^': 'caret',
        '&': 'ampersand',
        '|': 'pipe',
        '~': 'tilde',
        '`': 'backtick',
        ':': 'colon',
        '?': 'question mark',
        '=>': 'arrow function',
        '+=': 'plus equals',
        '-=': 'minus equals',
        '*=': 'times equals',
        '/=': 'divide equals',
        '++': 'increment',
        '--': 'decrement',
        '<<': 'left shift',
        '>>': 'right shift',
        '>>>': 'unsigned right shift',
        //'===': 'strict equals',
        '!==': 'strict not equals',
        '<<=': 'left shift equals',
        '>>=': 'right shift equals',
        '>>>=': 'unsigned right shift equals',
        '&=': 'and equals',
        '\'': 'single quote',
        '"': 'double quote',
        '\\': 'backslash',
        '`': 'backtick',
        '$': 'dollar sign',
        // Add more symbols as needed
        // may replace some characters with sounds
      };

      // Function to convert code line to spoken text
      // Function to convert code line to spoken text
      // Function to convert code line to spoken text
      const codeToSpeech = (line) => {
        // Trim the line to remove leading and trailing spaces
        const trimmedLine = line.trim();

        console.log("trimmedLine: ", trimmedLine)

        // Split the trimmed line by space to process each word/symbol separately
        const words = trimmedLine.split(' ');

        console.log("words: ", words)

        const spokenWords = words.map(word => {
          // Check if the entire word is a symbol and replace it with its spoken equivalent
          if (symbolMap[word]) {
            return symbolMap[word];
          }
          // If the word contains symbols, replace each symbol within the word
          let spokenWord = word;
          Object.entries(symbolMap).forEach(([symbol, replacement]) => {
            // Use a regex to replace symbols within the word, ensuring they're not part of a larger word
            const regex = new RegExp(`\\${symbol}`, 'g');
            spokenWord = spokenWord.replace(regex, ` ${replacement} `);
          });
          return spokenWord;
        });

        console.log("spokenWords joined: ", spokenWords.join(' '))

        return spokenWords.join(' ');
      };



      // Function to toggle speech granularity
      const toggleGranularity = () => {
        console.log("toggling granularity")
        setGranularity(prevGranularity => prevGranularity === 'token' ? 'character' : 'token');
      };

      // Add a command for toggling speech granularity
      editor.commands.addCommand({
        name: 'toggleGranularity',
        bindKey: { win: 'Ctrl-B', mac: 'Ctrl-B' },
        exec: toggleGranularity
      });

      // Function to read out the text using SpeechSynthesis with pauses between lines
      const speakText = (text) => {
        const lines = text.split('\n'); // Split the text into lines
        lines.forEach((line, index) => {
          let speechText;
          // Check the currently set granularity
          console.log(granularity)
          if (granularity === 'token') {
            speechText = codeToSpeech(line); // Use codeToSpeech for token granularity
          } else {
            line = line.trim();
            // For character granularity, read each character including spaces
            speechText = [...line].map(char => symbolMap[char] || char).join(', ');
          }
          speechText += (index < lines.length - 1 ? ", next line, " : ""); // Add ", next line, " between lines
          console.log(speechText)
          const speech = new SpeechSynthesisUtterance(speechText);
          window.speechSynthesis.speak(speech);
        });
      };




      // Add command to capture Ctrl+G
      editor.commands.addCommand({
        name: 'readCurrentLine',
        bindKey: { win: 'Ctrl-G', mac: 'Command-G' },
        exec: (editor) => {
          const cursorPosition = editor.getCursorPosition();
          const currentLine = editor.session.getDocument().getLine(cursorPosition.row);
          speakText(currentLine); // Read out the current line
        }
      });

      // Dynamic command to capture Ctrl+Number
      for (let i = 0; i <= 9; i++) { // Assuming 0-9 for X
        editor.commands.addCommand({
          name: `readLast${i}Lines`,
          bindKey: { win: `Ctrl-${i}`, mac: `Ctrl-${i}` },
          exec: (editor) => {
            const cursorPosition = editor.getCursorPosition();
            const startRow = Math.max(cursorPosition.row - i + 1, 0); // Ensure startRow is not negative
            const lines = [];
            for (let row = startRow; row <= cursorPosition.row; row++) {
              lines.push(editor.session.getDocument().getLine(row));
            }
            speakText(lines.join('\n')); // Read out the last X lines
          }
        });
      }




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

      // Ctrl + . = Drop marker 2
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

      // Add command to capture Ctrl+G
      editor.commands.addCommand({
        name: 'readCurrentLine',
        bindKey: { win: 'Ctrl-G', mac: 'Ctrl-G' },
        exec: (editor) => {
          console.log("speaking current line")
          const cursorPosition = editor.getCursorPosition();
          const currentLine = editor.session.getDocument().getLine(cursorPosition.row);
          speakText(currentLine); // Read out the current line
        }
      });

      // Command to read out the current function name
      editor.commands.addCommand({
        name: 'readCurrentFunctionName',
        bindKey: { win: 'Ctrl-V', mac: 'Ctrl-V' },
        exec: (editor) => {
          console.log("speaking current function")
          const cursorPosition = editor.getCursorPosition();
          const codeLines = editor.session.getDocument().getAllLines();

          // Simplified regex to match function declarations
          const functionRegex = /function\s+([a-zA-Z0-9_]+)\s*\(/;
          let currentFunctionName = '';

          // Loop through the lines up to the cursor's current line
          for (let i = 0; i <= cursorPosition.row; i++) {
            const match = functionRegex.exec(codeLines[i]);
            if (match) {
              currentFunctionName = match[1]; // Capture the function name
            }
          }

          if (currentFunctionName) {
            const speech = new SpeechSynthesisUtterance(`You are in the function ${currentFunctionName}`);
            window.speechSynthesis.speak(speech);
          } else {
            const speech = new SpeechSynthesisUtterance("You are not inside a function");
            window.speechSynthesis.speak(speech);
          }
        }
      });



      // Function to toggle character reading
      const toggleCharacterReading = () => {
        setIsReadingCharacters(!isReadingCharacters);
      };

      // Command to toggle character reading
      editor.commands.addCommand({
        name: 'toggleCharacterReading',
        bindKey: { win: 'Ctrl-Shift-S', mac: 'Ctrl-Shift-S' },
        exec: toggleCharacterReading
      });

      // Add command to execute code with a keyboard shortcut, e.g., Ctrl+Enter
      editor.commands.addCommand({
        name: 'executeCode',
        bindKey: { win: 'Ctrl-Enter', mac: 'Ctrl-Enter' },
        exec: () => onExecuteCode(),
      });





      const handleChange = (e) => {
        if (isReadingCharacters && e.action === 'insert' && e.lines.length === 1 && e.lines[0].length === 1) {
          speakCharacter(e.lines[0]);
        }
      };

      // Function to speak a character
      const speakCharacter = (char) => {
        const speech = new SpeechSynthesisUtterance(char);
        window.speechSynthesis.speak(speech);
      };

      // Add the event listener
      editor.getSession().on('change', handleChange);

      // Function to get indentation level of a line
      const getIndentationLevel = (line) => {
        const match = line.match(/^\s*/);
        return match ? match[0].length : 0;
      };


      let previousLineIndentation = 0;

      // Event listener for cursor position change
      editor.getSession().selection.on('changeCursor', () => {
        const cursorPosition = editor.getCursorPosition();
        const currentLine = editor.session.getLine(cursorPosition.row);
        const currentChar = currentLine[cursorPosition.column];

        // Check for open and close brackets
        if (currentChar === '{' || currentChar === '[') {
          controlMotor('thumb', 'tap');
        } else if (currentChar === '}' || currentChar === ']') {
          controlMotor('little', 'tap');
        }

        // Your existing indentation logic can remain here
        const currentLineIndentation = getIndentationLevel(currentLine);
        if (currentLineIndentation > previousLineIndentation) {
          controlMotor('fourth', 'tap'); // Indentation increased
        } else if (currentLineIndentation < previousLineIndentation && cursorPosition.row !== 0) {
          controlMotor('index', 'tap'); // Indentation decreased
        }
        setPreviousLineIndentation(currentLineIndentation);
      });



      // Cleanup function to remove the event listener
      return () => {
        editor.getSession().selection.off('changeCursor');
        editor.getSession().off('change', handleChange);
      };

    }
  }, [focused, granularity, setGranularity, isReadingCharacters, onExecuteCode]);


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