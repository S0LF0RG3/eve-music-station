import { useState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { LibraryTrack, MusicLibrary } from '@/lib/musicLibrary'
import { 
  Link as LinkIcon, 
  Copy, 
  Check, 
  Code,
  Share as ShareIcon,
  QrCode as QrCodeIcon,
  DownloadSimple 
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import QRCode from 'qrcode'

interface ShareModalProps {
  track: LibraryTrack | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShareModal({ track, open, onOpenChange }: ShareModalProps) {
  const [copied, setCopied] = useState<'link' | 'embed' | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const shareUrl = track ? MusicLibrary.getShareUrl(track.id) : ''
  const embedCode = track ? MusicLibrary.getEmbedCode(track.id) : ''

  useEffect(() => {
    if (open && track) {
      generateQRCode()
    }
  }, [open, shareUrl, track])

  const generateQRCode = async () => {
    try {
      const url = await QRCode.toDataURL(shareUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#75C285',
          light: '#0F0F14',
        },
      })
      setQrCodeUrl(url)
    } catch (err) {
      console.error('Failed to generate QR code', err)
    }
  }

  const downloadQRCode = () => {
    if (!qrCodeUrl || !track) return
    const link = document.createElement('a')
    link.href = qrCodeUrl
    link.download = `${track.title}-qrcode.png`
    link.click()
    toast.success('QR code downloaded!')
  }

  if (!track) return null

  const copyToClipboard = async (text: string, type: 'link' | 'embed') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      toast.success(`${type === 'link' ? 'Link' : 'Embed code'} copied to clipboard!`)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: track.title,
          text: `Check out this track I generated: ${track.title}`,
          url: shareUrl,
        })
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          toast.error('Failed to share')
        }
      }
    } else {
      copyToClipboard(shareUrl, 'link')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="backdrop-cosmic max-w-2xl">
        <DialogHeader>
          <DialogTitle className="glow-text flex items-center gap-2">
            <ShareIcon className="h-5 w-5 text-accent" weight="fill" />
            Share Track
          </DialogTitle>
          <DialogDescription>
            Share "{track.title}" with others using a direct link or embed it on your website
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="link">Direct Link</TabsTrigger>
            <TabsTrigger value="qrcode">QR Code</TabsTrigger>
            <TabsTrigger value="embed">Embed</TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-accent" weight="bold" />
                <h4 className="text-sm font-medium">Shareable Link</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Copy this link to share your track. Anyone with the link can listen to it.
              </p>
              <div className="flex gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="font-mono text-xs bg-background/50"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(shareUrl, 'link')}
                  className="gap-2 shrink-0"
                >
                  {copied === 'link' ? (
                    <>
                      <Check className="h-4 w-4" weight="bold" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" weight="bold" />
                      Copy
                    </>
                  )}
                </Button>
              </div>

              {'share' in navigator && (
                <Button
                  onClick={shareNative}
                  className="w-full gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <ShareIcon className="h-4 w-4" weight="fill" />
                  Share via...
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="qrcode" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <QrCodeIcon className="h-5 w-5 text-accent" weight="bold" />
                <h4 className="text-sm font-medium">QR Code</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Scan this QR code with a mobile device to instantly access the track.
              </p>
              {qrCodeUrl ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 rounded-lg bg-background border border-border">
                    <img src={qrCodeUrl} alt="QR Code" className="w-[300px] h-[300px]" />
                  </div>
                  <Button
                    onClick={downloadQRCode}
                    className="w-full gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    <DownloadSimple className="h-4 w-4" weight="bold" />
                    Download QR Code
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center p-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-accent border-t-transparent" />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="embed" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Code className="h-5 w-5 text-accent" weight="bold" />
                <h4 className="text-sm font-medium">Embed Code</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Copy this HTML code to embed the player on your website or blog.
              </p>
              <div className="space-y-2">
                <textarea
                  value={embedCode}
                  readOnly
                  rows={4}
                  className="w-full p-3 rounded-md font-mono text-xs bg-background/50 border border-input resize-none"
                  onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                />
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(embedCode, 'embed')}
                  className="w-full gap-2"
                >
                  {copied === 'embed' ? (
                    <>
                      <Check className="h-4 w-4" weight="bold" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" weight="bold" />
                      Copy Embed Code
                    </>
                  )}
                </Button>
              </div>

              <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <h5 className="text-xs font-medium mb-2 text-accent">Preview</h5>
                <div className="aspect-[2/1] bg-background/50 rounded-md overflow-hidden">
                  <iframe
                    src={`${shareUrl}?embedded=true`}
                    className="w-full h-full"
                    title="Player preview"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
