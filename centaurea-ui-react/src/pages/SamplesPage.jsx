import AsyncContent from '../components/AsyncContent';
import Button from '../components/Button';
import Card from '../components/Card';
import Section from '../components/Section';
import SectionHeader from '../components/SectionHeader';
import { useApi } from '../providers';

function CardContentSample({ item }) {
  return (
    <>
      <div className="card--item__expression">{item.expressionText}</div>
      <div className="card--item__result">{item.result}</div>
      <div className="card--item__time">{new Date(item.computedTime).toLocaleString()}</div>
    </>
  );
}

function SamplesPage() {
  const { getSamples: { data: samples = [], isFetching, isError, error, refetch } } = useApi();

  return (
    <Section>
      <SectionHeader title="Sample Expressions">
        <Button type="button" onClick={() => refetch()} disabled={isFetching}>
          Refresh
        </Button>
      </SectionHeader>

      <AsyncContent
        isFetching={isFetching}
        isError={isError}
        error={error}
        isEmpty={samples.length === 0}
        emptyMessage="No sample expressions available"
      >
        <ul className="list list--items">
          {samples.map((item) => (
            <Card key={item.id} as="li" variant="item">
              <CardContentSample item={item} />
            </Card>
          ))}
        </ul>
      </AsyncContent>
    </Section>
  );
}

export default SamplesPage;
