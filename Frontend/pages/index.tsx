import React, { useEffect, useState, ChangeEvent, useContext } from 'react';
import { useRouter } from 'next/router';
import styles from '@/styles/base.module.css';
import classnames from 'classnames';
import { exec } from 'child_process';
import {
  UploadOutlined,
  CloudDownloadOutlined,
  CloudUploadOutlined,
} from '@ant-design/icons';
import { Button, message, Upload } from 'antd';
import { saveAs, encodeBase64 } from '@progress/kendo-file-saver';
import { createRequire } from 'module';
import axios from 'axios';
import { EmbedContext } from '@/context/EmbedContext';

const Home = () => {
  const { state, dispatch } = useContext(EmbedContext);
  const [isNameShow, setIsNameShow] = useState(false);
  const [files, setFile] = useState('');
  const [output, setOutput] = useState('');
  const [name, setName] = useState();

  const router = useRouter();

  const beforeUpload = (file: any) => {
    if (file.size > 200000000) {
      message.warning('This is large file.');
      setIsNameShow(false);
      return false;
    } else if (file.type !== 'application/pdf') {
      message.warning('This is not PDF file.');
      setIsNameShow(false);
      return false;
    } else {
      // axios.post;
      setFile(file);
      setName(file.name);
      handleUploadClick(file, file.name);
      setIsNameShow(true);
      return true;
    }
  };

  const handleUploadClick = async (file: any, filename: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('originalname', filename);

    try {
      const response = await axios.post(
        'http://localhost:8080/api/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      await dispatch({
        type: 'SET_FLAG_EMBED',
        payload: { isEmbed: true },
      });
    } catch (error) {
      console.error(error);
    }
  };

  const analysis = async () => {
    const formData = new FormData();
    formData.append('filePath', name ?? '');
    let flag = state.isNavigate;
    if (state.isEmbed === true) {
      const response = await axios.post(
        'http://localhost:8080/api/train',
        JSON.stringify({
          filePath: 'name',
        }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      await dispatch({
        type: 'SET_FLAG_NAVIGATE',
        payload: { isNavigate: true },
      });
      flag = true;
    }
    if (flag) {
      if (state.isEmbed) {
        await dispatch({
          type: 'SET_FLAG_EMBED',
          payload: { isEmbed: false },
        });
      }
      await router.push('/analyser');
    }
  };

  return (
    <div style={{ maxWidth: '1024px', margin: 'auto' }}>
      <div>
        <p className={styles.font_42}> Document Analyzer</p>
        <p className={classnames(styles.font_26, styles.padding_bottom_20)}>
          {' '}
          Analyze your document and extract important information
        </p>
        <p className={styles.font_42}> Input Data</p>
        <p className={classnames(styles.font_26, styles.padding_bottom_20)}>
          {' '}
          Choose a Word or PDF file
        </p>
      </div>
      <div
        className={classnames(styles.div_color)}
        style={{ marginBottom: '20px' }}
      >
        <div
          style={{
            width: '100%',
            backgroundColor: '#f0f2f6',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div style={{ padding: '0 20px' }}>
            <CloudUploadOutlined style={{ fontSize: '80px' }} />
          </div>
          <div style={{ width: '100%' }}>
            <p className={classnames(styles.font_26)}>
              {' '}
              Drag and drop file here
            </p>
            <p className={classnames(styles.font_26, styles.font_color)}>
              {' '}
              Limite 200MB per file.PDF,*.DOC,*.DOCX{' '}
            </p>
          </div>
          <div style={{ backgroundColor: '#f0f2f6', padding: '20px' }}>
            <Upload
              maxCount={1}
              beforeUpload={beforeUpload}
              multiple={false}
              showUploadList={isNameShow}
            >
              <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
          </div>
        </div>
      </div>
      <div>
        <Button onClick={() => analysis()}>Run Analysis</Button>
      </div>
    </div>
  );
};

export default Home;
