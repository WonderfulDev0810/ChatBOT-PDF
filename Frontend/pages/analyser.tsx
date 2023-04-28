import React, { useEffect, useState, useContext } from 'react';
import styles from '@/styles/base.module.css';
import { useRouter } from 'next/router';
import { Button, Input } from 'antd';
import jsPDF from 'jspdf';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { EmbedContext } from '@/context/EmbedContext';

const { TextArea } = Input;

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { state, dispatch } = useContext(EmbedContext);
  const [flag, setFlag] = useState(false);
  const [people, setPeople] = useState();
  const [cties, setCties] = useState();
  const [summary, setSummary] = useState();
  const router = useRouter();

  useEffect(() => {
    fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: 'what name are there people with in this docs',
        // question: 'Please list the cities in the document',
        history: '',
      }),
    })
      .then(async (respeople) => {
        const dataPeople = await respeople.json();
        setPeople(dataPeople.text);
        fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: 'Please list the cities in the document',
            history: '',
          }),
        }).then(async (resCities) => {
          const dataCities = await resCities.json();
          setCties(dataCities.text);
          fetch('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              question: 'What is a summary in this document?',
              history: '',
            }),
          })
            .then(async (resSummary) => {
              const dataSummary = await resSummary.json();
              setSummary(dataSummary.text);
            })
            .catch((errSummary) => {
              console.log(errSummary);
            });
        });
      })
      .catch((errcities) => {
        console.log(errcities);
      })
      .catch((err) => {
        console.log(err);
      });
    // } else {
    //   console.log('Please train your DOCS!');
    // }
  }, [state.isEmbed]);

  const pdfStyles = StyleSheet.create({
    page: {
      flexDirection: 'row',
      backgroundColor: '#E4E4E4',
    },
    section: {
      margin: 10,
      padding: 10,
      flexGrow: 1,
    },
  });
  const MyDocument = () => (
    <Document>
      <Page style={pdfStyles.page}>
        <View>
          <Text>${people}</Text>
        </View>
      </Page>
    </Document>
  );

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    var y = 20;
    doc.setFontSize(24);
    doc.text('People', 10, y);
    y += doc.getTextDimensions('people').h;
    doc.setFontSize(16);
    var textLines = doc.splitTextToSize(people ?? '', 190);
    doc.text(textLines, 10, y);
    y += doc.getTextDimensions(textLines).h + 15;
    doc.setFontSize(24);
    doc.text('Cties', 10, y);
    y += doc.getTextDimensions('Cties').h;
    doc.setFontSize(16);
    textLines = doc.splitTextToSize(cties ?? '', 190);
    if (y + doc.getTextDimensions(textLines).h > pageHeight) {
      doc.addPage();
      y = 20;
    }
    doc.text(textLines, 10, y);
    y += doc.getTextDimensions(textLines).h + 15;
    doc.setFontSize(24);

    doc.text('Summary', 10, y);
    y += doc.getTextDimensions('Summary').h;
    doc.setFontSize(16);
    textLines = doc.splitTextToSize(summary ?? '', 190);
    if (y + doc.getTextDimensions(textLines).h > pageHeight) {
      doc.addPage();
      y = 20;
    }
    doc.text(textLines, 10, y);
    y += doc.getTextDimensions(textLines).h + 15;
    doc.save('example.pdf');
  };

  return (
    <>
      <div
        style={{
          maxWidth: '1024px',
          margin: 'auto',
          border: '1px',
          borderColor: '#f02323',
        }}
      >
        <div className={styles.div_padding}>
          <p className={styles.font_42}>Document Analyzer</p>
        </div>
        <div>
          <p className={styles.font_26}>People</p>
          <TextArea
            className={styles.textArea}
            style={{ height: '150px' }}
            value={people}
            // disabled
          ></TextArea>
        </div>
        <div>
          <p className={styles.font_26}>Cties</p>
          <TextArea
            className={styles.textArea}
            style={{ height: '150px' }}
            value={cties}
          ></TextArea>
        </div>
        <div>
          <p className={styles.font_26}>Summary</p>
          <TextArea
            className={styles.textArea}
            style={{ height: '150px' }}
            value={summary}
          ></TextArea>
        </div>

        <div>
          <Button className={styles.button} onClick={generatePDF}>
            Download analysis
          </Button>{' '}
          <br />
          <Button
            className={styles.button}
            onClick={async () => {
              await router.push('/');
            }}
          >
            Analyze another document
          </Button>
        </div>
      </div>
    </>
  );
};

export default Home;
