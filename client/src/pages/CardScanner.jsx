import React, { useState, useRef, useEffect } from 'react';
import { Button, Card, message, Spin } from 'antd';
import {
  CameraOutlined,
  UploadOutlined,
  MailOutlined,
  PhoneOutlined,
  GlobalOutlined,
  HomeOutlined,
  UserOutlined,
  BankOutlined,
} from '@ant-design/icons';
import Tesseract from 'tesseract.js';
import MobileDetect from 'mobile-detect';

const CardScanner = () => {
  const [image, setImage] = useState(null);
  const [scannedData, setScannedData] = useState({});
  const [loading, setLoading] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);

  const fileInputRef = useRef();
  const videoRef = useRef();

  const isMobileDevice = () => {
    const md = new MobileDetect(window.navigator.userAgent);
    return !!md.mobile();
  };

  const startScanner = () => {
    if (isMobileDevice()) {
      openCamera();
      message.info('Camera functionality is enabled on mobile devices.');
    } else {
      fileInputRef.current.click();
    }
  };

  const openCamera = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          const videoDevices = devices.filter(device => device.kind === 'videoinput');
          if (videoDevices.length > 0) {
            // Try to access the first available camera
            navigator.mediaDevices
              .getUserMedia({ video: { deviceId: videoDevices[0].deviceId } })
              .then((stream) => {
                setCameraStream(stream);
                videoRef.current.srcObject = stream;
                setIsCameraActive(true);
              })
              .catch((error) => {
                console.error('Error accessing camera: ', error);
                message.error('Unable to access the camera. Please check permissions.');
              });
          } else {
            message.error('No camera found. Please ensure your device has a camera.');
          }
        })
        .catch((error) => {
          console.error('Error enumerating devices: ', error);
          message.error('Unable to detect camera devices. Please check permissions.');
        });
    } else {
      message.error('Camera functionality is not supported on this device.');
    }
  };
  
  

  const stopCamera = () => {
    if (cameraStream) {
      const tracks = cameraStream.getTracks();
      tracks.forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const handleCapture = () => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/png');
    setImage(imageData);
    processImage(imageData);
    stopCamera();
  };

  const handleImageUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target.result);
      processImage(e.target.result);
    };
    reader.readAsDataURL(file);
    return false;
  };

  const processImage = (imageData) => {
    setLoading(true);
    Tesseract.recognize(imageData, 'eng', {
      logger: (info) => console.log(info),
    })
      .then(({ data: { text } }) => {
        setLoading(false);
        extractCardData(text);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        message.error('Failed to process the image. Please try again.');
      });
  };

  const extractCardData = (text) => {
    const fullText = text;

    // Refined regex patterns
    const email = text.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i)?.[0] || 'N/A';
    const phones = text.match(/(?:\+?\d{1,3})?[-.\s]?\(?\d{2,4}\)?[-.\s]?\d{3}[-.\s]?\d{3,4}/g) || [];
    const website = text.match(/\b(?:http[s]?:\/\/)?(?:www\.)?[a-zA-Z0-9.-]+\.[a-z]{2,}\b/i)?.[0] || 'N/A';

    const name = text.match(/(?:Mr\.|Ms\.|Mrs\.|Dr\.)?\s?[A-Z][a-z]+(?:\s[A-Z][a-z]+)+/)?.[0] || 'N/A';

    const company = text.match(
      /\b[A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)*\s(?:Inc|Ltd|LLC|Solutions|Technologies|Corp|Enterprises|Group|Co)\b/i
    )?.[0] || 'N/A';

    // Updated address regex to handle a broader range of formats
    const address = text.match(
      /\d+\s[\w\s.,]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Square|Sq|Plaza|Plz|Way|Terrace|Ter|Circle|Cir)\b.*?(?=\n|$)/i
    )?.[0] || 'N/A';

    if (name === 'N/A' || company === 'N/A' || address === 'N/A') {
      console.warn('Some fields could not be extracted accurately. Check the regex or the input text format.');
    }

    setScannedData({ fullText, email, phones, website, name, company, address });

    if (fullText.trim() === '') {
      message.warning('Unable to extract text. Please try with a clearer image.');
    } else {
      message.success('Card scanned successfully!');
    }
  };

  useEffect(() => {
    // Cleanup camera when component unmounts
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div style={{ background: '#f4f6f8', minHeight: '100vh', padding: '10px' }}>
      <Card
        title="Business Card Scanner"
        style={{
          maxWidth: '100%',
          width: '95%',
          margin: 'auto',
          marginTop: '150px',
          borderRadius: '10px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          background: '#ffffff',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '200px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '20px',
            backgroundColor: '#f9f9f9',
            borderRadius: '10px',
            boxShadow: image ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
          }}
        >
          {image ? (
            <img
              src={image}
              alt="Scanned Card"
              style={{
                maxWidth: '100%',
                height: '200px',
                borderRadius: '10px',
              }}
            />
          ) : isCameraActive ? (
            <video
              ref={videoRef}
              autoPlay
              style={{
                maxWidth: '100%',
                height: '200px',
                borderRadius: '10px',
                backgroundColor: '#000',
              }}
            />
          ) : (
            <p style={{ textAlign: 'center', color: '#888', fontSize: '16px' }}>
              Upload a business card image to scan.
            </p>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <Button
            type="primary"
            size="large"
            icon={isMobileDevice() ? <CameraOutlined /> : <UploadOutlined />}
            onClick={startScanner}
            style={{ borderRadius: '5px', backgroundColor: '#1677ff', border: 'none' }}
          >
            {isMobileDevice() ? 'Open Camera' : 'Upload Image'}
          </Button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={(e) => handleImageUpload(e.target.files[0])}
          />
        </div>

        {isCameraActive && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Button
              type="primary"
              onClick={handleCapture}
              style={{ borderRadius: '5px', backgroundColor: '#1677ff', border: 'none' }}
            >
              Capture
            </Button>
          </div>
        )}
      </Card>

      <Card
        title="Scanned Data"
        style={{
          maxWidth: '100%',
          width: '95%',
          margin: '20px auto',
          borderRadius: '10px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          background: '#ffffff',
          maxHeight: '500px',
          overflowY: 'auto',
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="large" />
            <p style={{ marginTop: '10px', fontSize: '16px', color: '#888' }}>Processing...</p>
          </div>
        ) : (
          <div style={{ padding: '20px', width: '350px' }}>
            {Object.keys(scannedData).length > 0 && (
              <>
                <p>
                  <strong style={{ color: '#555', fontSize: '16px' }}>Full Text:</strong>
                </p>
                <pre
                  style={{
                    whiteSpace: 'pre-wrap',
                    background: '#f9f9f9',
                    padding: '10px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    color: '#333',
                    maxHeight: '400px',
                    overflowY: 'auto',
                  }}
                >
                  {scannedData.fullText}
                </pre>
                <p>
                  <UserOutlined /> Name: {scannedData.name || 'N/A'}
                </p>
                <p>
                  <BankOutlined /> Company: {scannedData.company || 'N/A'}
                </p>
                <p>
                  <MailOutlined /> Email:{' '}
                  <a href={`mailto:${scannedData.email}`} style={{ textDecoration: 'underline', color: 'blue' }}>
                    {scannedData.email}
                  </a>
                </p>
                <p>
                  <PhoneOutlined /> Phone:{' '}
                  {scannedData.phones.length > 0
                    ? scannedData.phones.map((phone, index) => (
                        <span key={index}>
                          <a href={`tel:${phone}`} style={{ textDecoration: 'underline', color: 'blue' }}>
                            {phone}
                          </a>
                          {index < scannedData.phones.length - 1 ? ', ' : ''} 
                        </span>
                      ))
                    : 'N/A'}
                </p>
                <p>
                  <HomeOutlined /> Address: {scannedData.address || 'N/A'}
                </p>
                <p>
                  <GlobalOutlined /> Website:{' '}
                  <a
                    href={scannedData.website.startsWith('http') ? scannedData.website : `http://${scannedData.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'underline', color: 'blue' }}
                  >
                    {scannedData.website}
                  </a>
                </p>
              </>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default CardScanner;


