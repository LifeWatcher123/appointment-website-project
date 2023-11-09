import { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { PieChart } from 'react-minimal-pie-chart';
import { toast } from 'react-toastify';
import { socket } from '../../../socket';
import { customFetch } from '../../../utils';

const FeedbackAnalytics = () => {
  const [feedbacks, setFeedbacks] = useState([])
  const [pieData, setPieData] = useState({})

  const fetchAll = () => {
    customFetch(`${global.server_backend_url}/backend/admin/feedbacks`, {})
      .then((response) => {
        if (response.ok) return response.json();
        throw response;
      })
      .then((data) => {
        setFeedbacks(data);
      })
      .catch((error) => {
        console.error(error);
        toast("Something went wrong when fetching pending users.");
      });
  }

  useEffect(() => {
    fetchAll()
    socket.on("notify", () => {
      fetchAll()
    });
  }, [])

  useEffect(() => {
    let feedbackToChartData = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    }
    feedbacks.forEach(element => {
      feedbackToChartData[element.rating] = feedbackToChartData[element.rating] + 1
    })
    setPieData(
      Object.entries(feedbackToChartData).map(([title, value]) => {
        let color
        switch (title) {
          case '1': color = "#C13C37"
            break
          case '2': color = "#F49D37"
            break
          case '3': color = "#3F88C5"
            break
          case '4': color = "#77B28C"
            break
          case '5': color = "#499F68"
            break
          default: break
        }
        return ({ title, value, color: color })
      })
    )
  }, [feedbacks])

  return (
    <div>
      <Card className="shadow-sm">
        <Card.Header as={"h2"}>Feedback Analytics</Card.Header>
        <Card.Body>
          <PieChart
            data={pieData}
            label={({ dataEntry }) => `${dataEntry.title} : ${Math.round(dataEntry.percentage)}%`}
            labelStyle={(index) => ({
              fill: pieData[index].color,
              fontSize: '0.2rem',
              fontFamily: 'sans-serif',
            })}
            radius={23}
            labelPosition={116}
          />
        </Card.Body>
      </Card>
    </div>
  );
};

export default FeedbackAnalytics;
