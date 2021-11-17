import { useState, useEffect, ChangeEvent } from "react";

import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { Box, Button, Image } from "@chakra-ui/react";
import FileUpload from "@/components/Common/FileUpload";
const ffmpeg = createFFmpeg({ log: true });

interface IVideo {
  videoFile: File;
  videoURL: string;
}

const MP4ToGIF = (): JSX.Element => {
  const [ready, setReady] = useState(false);
  const [video, setVideo] = useState<IVideo>();
  const [gif, setGif] = useState<string>();

  const load: () => void = async () => {
    if (ffmpeg.isLoaded()) {
      setReady(true);
    } else {
      await ffmpeg.load();
      setReady(true);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleVideoUpload = (e: ChangeEvent<HTMLInputElement>): void => {
    const fileList = e.target.files;
    if (!fileList) return;
    const file = fileList[0];
    setVideo({ videoFile: file, videoURL: URL.createObjectURL(file) });
  };

  const handleConvert: () => void = async () => {
    if (!video) return;
    ffmpeg.FS(
      "writeFile",
      "toBeConverted.mp4",
      await fetchFile(video?.videoFile as File)
    );
    await ffmpeg.run("-i", "toBeConverted.mp4", "-f", "gif", "converted.gif");
    const data = ffmpeg.FS("readFile", "converted.gif");

    const url = URL.createObjectURL(
      new Blob([data.buffer], { type: "image/gif" })
    );
    setGif(url);
  };

  return (
    <>
      <FileUpload
        onChange={handleVideoUpload}
        label="Upload Video"
        accept="video/*"
      />
      {video && (
        <Box mt={4} maxW="500px">
          <video controls src={video?.videoURL} />
        </Box>
      )}
      <Button
        onClick={handleConvert}
        mt={4}
        disabled={!ready || !video?.videoURL}
      >
        Convert to GIF
      </Button>
      {gif && <Image mt={4} src={gif} maxW="500px" alt="Converted GIF" />}
    </>
  );
};

export default MP4ToGIF;
