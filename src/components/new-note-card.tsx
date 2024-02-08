import React, { ChangeEvent, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { toast } from 'sonner'

interface NewNoteCardProps {
  onNoteCreated: (coontent: string) => void
}

let speechRecognition: SpeechRecognition | null = null

const NewNoteCard = ({ onNoteCreated }: NewNoteCardProps) => {

  const [shouldShowOnBording, setShouldShowOnBording] = useState(true)
  const [isReCording, setIsRecording] = useState(false)
  const [content, setContent] = useState('')

  function handleStartEditor() {
    setShouldShowOnBording(false)
  }

  function handleContentChanged(event: ChangeEvent<HTMLTextAreaElement>) {
    setContent(event.target.value)

    if (event.target.value === '') {
      setShouldShowOnBording(true)
    }
  }

  function handleSaveNote(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()

    if (content === '') {
      return
    }

    onNoteCreated(content)

    setContent('')
    setShouldShowOnBording(true)

    toast.success('Nota criada com sucesso')
  }

  function handleStartRecording() {

    const isSpeechRecognitionAPIAvalable = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window

    if (!isSpeechRecognitionAPIAvalable) {
      alert('Infelizmente seu navegador não suporta a API de gravação')
      return
    }

    setIsRecording(true)
    setShouldShowOnBording(false)

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition

    speechRecognition = new SpeechRecognitionAPI()

    speechRecognition.lang = 'pt-BR'
    speechRecognition.continuous = true
    speechRecognition.maxAlternatives = 1
    speechRecognition.interimResults = true

    speechRecognition.onresult = (event) => {
      const transcription = Array.from(event.results).reduce((text, result) => {
        return text.concat(result[0].transcript)
      }, '')

      setContent(transcription)
    }

    speechRecognition.onerror = (event) => {
      console.error(event)
    }

    speechRecognition.start()

  }

  function handleStopRecording() {
    setIsRecording(false)

    if (speechRecognition) {
      speechRecognition.stop()
    }
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger className='rounded-md flex flex-col bg-slate-700 p-5 gap-y-3 outline-none text-left hover:ring-2 hover:ring-slate-600 focus:ring-2 focus:ring-lime-400'>
        <span className='text-sm font-medium text-slate-200'>Adicionar Nota</span>
        <p className='text-sm leading-6 text-slate-400'>Grave uma nota em áudio que será convertida para texto automaticamente.</p>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className='inset-0 fixed bg-black/50' />
        <Dialog.Content className='fixed overflow-hidden inset-0 md:inset-auto md:left-1/2 md:top-1/2  md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] md:w-full md:h-[60vh] bg-slate-700 md:rounded-md flex flex-col outline-none'>

          <Dialog.Close className='absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100'>
            <X className='size-5' />
          </Dialog.Close>

          <form className='flex-1 flex flex-col'>

            <div className='flex flex-1 flex-col gap-3 p-5'>
              <span className='text-sm font-medium text-slate-200'>Adicionar nota</span>

              {shouldShowOnBording ?
                <p className='text-sm leading-6 text-slate-300'>
                  Comece{' '}
                  <button
                    type='button'
                    className='font-medium text-lime-400 hover:underline'
                    onClick={handleStartRecording}>
                    gravando uma nota
                  </button>
                  {' '}em áudio ou se preferir{' '}
                  <button
                    type='button'
                    onClick={handleStartEditor}
                    className='font-medium text-lime-400 hover:underline' >
                    {' '}utilize apenas texto{' '}
                  </button>
                  .
                </p> :
                <textarea
                  autoFocus
                  className='text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none'
                  onChange={handleContentChanged}
                  value={content}
                >

                </textarea>}

            </div>

            {isReCording ? (<button
              type='button'
              onClick={handleStopRecording}
              className='w-full flex items-center justify-center gap-2 bg-slate-900 py-4 text-center text-sm text-slate-300 outiline-none font-medium hover:text-slate-100'>
              <div className='size-3 rounded-full bg-red-500 animate-pulse' />
              Gravando! (click p/ interromper)
            </button>) : (<button
              type='button'
              onClick={handleSaveNote}
              className='w-full bg-lime-400 py-4 text-center text-sm text-lime-950 outiline-none font-medium hover:bg-lime-500'>
              Salvar Nota
            </button>)}

          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root >
  )
}

export default NewNoteCard